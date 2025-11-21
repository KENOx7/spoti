import { Track } from "@/types";

const DEFAULT_TIMEOUT = 8000; // Timeout-u artırdıq, bəzi serverlər yavaş olur
const MAX_RETRIES = 2;

// Timeout helper (dəyişmədi)
function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function safeFetch(url: string, opts: any = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const signal = timeoutSignal(timeout);
      const res = await fetch(url, { ...opts, signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err: any) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw new Error("Fetch failed");
}

// === YENİ PLAN A — saavn.dev (2025-ci ildə ən stabil işləyən, 320kbps TAM mahnı verir) ===
async function searchSaavnDev(query: string): Promise<string | null> {
  try {
    console.log(`🔥 Plan A — saavn.dev: "${query}"`);
    const searchUrl = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=3`;
    const res = await safeFetch(searchUrl, {}, 10000);
    const json = await res.json();

    if (json.success && json.data?.results?.length > 0) {
      // Ən uyğun nəticəni seçirik (ilk adətən ən yaxşısı olur)
      const song = json.data.results[0];

      if (song.downloadUrl?.length > 0) {
        // 320kbps > 160kbps > 96kbps > ...
        const best = song.downloadUrl.find((d: any) => d.quality === "320kbps") 
                  || song.downloadUrl.find((d: any) => d.quality === "160kbps") 
                  || song.downloadUrl[song.downloadUrl.length - 1];

        if (best?.url) {
          console.log(`[saavn.dev] 320kbps TAM mahnı tapıldı!`);
          return best.url; // Direct link, heç bir ziyan yoxdur, çünki JioSaavn-ın öz CDN-indən gəlir
        }
      }
    }
    return null;
  } catch (err) {
    console.warn("[saavn.dev] xəta");
    return null;
  }
}

// === PLAN B — Invidious (YouTube-dan TAM audio, 2025-də hələ işləyən instanslar) ===
const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
  "https://invidious.privacyredirect.com",
  "https://invidious.materialioapps.com",
  "https://invidious.io.lol",
  "https://invidious.perennialte.ch",
  "https://inv.bp.projectsegfau.lt"
];

async function searchInvidious(query: string): Promise<string | null> {
  console.log(`🔍 Plan B — Invidious (YouTube): "${query}"`);

  const shuffled = [...INVIDIOUS_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // Daha dəqiq nəticə üçün "official audio" və ya "topic" əlavə edirik
      const safeQuery = encodeURIComponent(query + " official audio");
      const searchRes = await safeFetch(`${base}/api/v1/search?q=${safeQuery}&type=video`, {}, 7000);
      const results = await searchRes.json();

      if (!Array.isArray(results) || results.length === 0) continue;

      const videoId = results[0].videoId;
      const infoRes = await safeFetch(`${base}/api/v1/videos/${videoId}`, {}, 7000);
      const info = await infoRes.json();

      const audioFormats = (info.adaptiveFormats || [])
        .filter((f: any) => f.type?.includes("audio"))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioFormats[0]?.url) {
        const url = audioFormats[0].url;
        console.log(`[Invidious] TAM audio tapıldı: ${base}`);
        return url; // Tam mahnı, expire ~6 saat, demo üçün yetər
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === PLAN C — iTunes (30s preview – son çarə) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    console.log(`🍎 Plan C — iTunes preview: "${query}"`);
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await safeFetch(url);
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

// === ƏSAS FUNKSIYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  let query = `${track.artist} ${track.title}`.replace(/\(.*?\)|feat\.?.*|official video|lyrics/gi, "").trim();

  // Daha təmiz sorğu
  query = query + " audio"; // YouTube-da daha yaxşı nəticə verir

  // 1) ən keyfiyyətli və stabil → saavn.dev (320kbps TAM mahnı)
  const saavn = await searchSaavnDev(query);
  if (saavn) return saavn;

  // 2) YouTube-dan TAM audio (Invidious)
  const yt = await searchInvidious(query);
  if (yt) return yt;

  // 3) iTunes 30s preview
  const itunes = await searchiTunes(query);
  if (itunes) return itunes;

  console.error("Heç bir yerdə tapılmadı :(");
  return null;
}
