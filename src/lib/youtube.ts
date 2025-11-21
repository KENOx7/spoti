import { Track } from "@/types";

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 1; // Çox yükləməmək üçün 1 dəfə təkrar bəsdir

// Timeout helper
function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

// Təhlükəsiz fetch funksiyası (Timeout + Retry)
async function safeFetch(url: string, opts: any = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const signal = timeoutSignal(timeout);
      const res = await fetch(url, { ...opts, signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err: any) {
      const last = attempt === MAX_RETRIES;
      if (last) throw err;
      // Qısa gözləmə (backoff)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error("Fetch failed");
}

// === PLAN A — saavn.me (Ən təmiz səs - 320kbps) ===
async function searchSaavnMe(query: string): Promise<string | null> {
  try {
    console.log(`🔥 Plan A — saavn.me: "${query}"`);
    // limit=1 bəs edir, çox yükləməyə ehtiyac yoxdur
    const searchUrl = `https://saavn.me/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;
    
    const res = await safeFetch(searchUrl, {}, 12000);
    const json = await res.json();

    if (json?.status === "SUCCESS" && json.data?.results?.length > 0) {
      const song = json.data.results[0];
      const urls = song.downloadUrl || song.download_urls;

      if (urls && urls.length > 0) {
        // 320kbps > 160kbps > 96kbps
        const best = urls.find((d: any) => d.quality === "320kbps") 
                  || urls.find((d: any) => d.quality === "160kbps") 
                  || urls[urls.length - 1];

        // link və ya url ola bilər (API versiyasına görə dəyişir)
        const finalUrl = best?.link || best?.url;
        
        if (finalUrl) {
          console.log(`[saavn.me] TAM 320kbps tapıldı!`);
          return finalUrl;
        }
      }
    }
    return null;
  } catch (err) {
    // console.warn("[saavn.me] xəta:", err);
    return null;
  }
}

// === PLAN B — Piped (YouTube TAM Audio - Ən stabil serverlər) ===
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.adminforge.de",
  "https://api.piped.privacydev.net",
  "https://pipedapi.ducks.party",
  "https://pipedapi.drgns.space"
];

async function searchPiped(query: string): Promise<string | null> {
  console.log(`🔥 Plan B — Piped (YouTube): "${query}"`);

  // Serverləri qarışdırırıq (Load balancing)
  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // "official audio" sözünü əlavə edirik ki, klip yox, audio gəlsin
      const safeQuery = encodeURIComponent(query + " official audio");
      
      // 1. Axtarış
      const searchRes = await safeFetch(`${base}/search?q=${safeQuery}&filter=music_songs`, {}, 6000);
      const results = await searchRes.json();

      if (!Array.isArray(results?.items) || results.items.length === 0) continue;

      // Video ID-ni tapırıq
      const videoId = results.items[0].url.split("/watch?v=")[1];
      if (!videoId) continue;

      // 2. Stream (Səs axını)
      const infoRes = await safeFetch(`${base}/streams/${videoId}`, {}, 6000);
      const info = await infoRes.json();

      const audioFormats = (info.audioStreams || [])
        .filter((f: any) => f.mimeType === "audio/mp4" || f.mimeType === "audio/webm")
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioFormats.length > 0 && audioFormats[0].url) {
        console.log(`[Piped:${base}] TAM audio tapıldı`);
        return audioFormats[0].url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === PLAN C — iTunes (Son Çarə - 30s Preview) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    console.log(`🍎 Plan C — iTunes preview: "${query}"`);
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await safeFetch(url, {}, 5000);
    const data = await res.json();
    
    if (data.resultCount > 0 && data.results[0].previewUrl) {
      console.log("[iTunes] 30s preview tapıldı");
      return data.results[0].previewUrl;
    }
    return null;
  } catch {
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Axtarış sorğusunu təmizləyirik (Mötərizələr, feat, lyrics sözləri silinir)
  const cleanTitle = track.title
    .replace(/\(.*?\)/g, "") // (Remix) və s. sil
    .replace(/feat\..*/i, "") // feat. sonrası sil
    .replace(/ft\..*/i, "")
    .trim();

  const query = `${cleanTitle} ${track.artist}`;

  // 1. Saavn.me (Ən yaxşı keyfiyyət)
  const saavn = await searchSaavnMe(query);
  if (saavn) return saavn;

  // 2. Piped (YouTube tam versiya)
  const piped = await searchPiped(query);
  if (piped) return piped;

  // 3. iTunes (Ən azı oxusun)
  const itunes = await searchiTunes(query);
  if (itunes) return itunes;

  console.error("❌ Mahnı heç bir yerdə tapılmadı");
  return null;
}
