import { Track } from "@/types";

const DEFAULT_TIMEOUT = 5000; // 5 saniyə
const MAX_RETRIES = 1;

// CORS Proxy (Bəzi API-lər üçün lazımdır)
const CORS_PROXY = "https://corsproxy.io/?";

// === SERVERLƏR (Daha etibarlı siyahı) ===
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.ot.ax",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.adminforge.de",
  "https://api.piped.privacydev.net",
  "https://pipedapi.drgns.space"
];

const INVIDIOUS_INSTANCES = [
  "https://vid.puffyan.us",
  "https://inv.tux.pizza",
  "https://invidious.drgns.space",
  "https://invidious.fdn.fr",
  "https://invidious.perennialteks.com"
];

// === KÖMƏKÇİ FUNKSİYALAR ===

function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function safeFetch(url: string, opts: any = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  try {
    const signal = timeoutSignal(timeout);
    const res = await fetch(url, { ...opts, signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    throw err;
  }
}

function cleanQuery(artist: string, title: string): string {
  const cleanArtist = artist.replace(/feat\.|ft\./gi, "").trim();
  // "Official Video" kimi sözləri saxlayırıq ki, cover yox, original gəlsin, 
  // amma mötərizələri təmizləyirik.
  let cleanTitle = title
    .replace(/\(.*\)/g, "") 
    .replace(/\[.*\]/g, "")
    .trim();
  
  return `${cleanArtist} - ${cleanTitle}`;
}

// Videonun müddətini yoxlayır (çox uzun miksləri və ya şortları istəmirik)
function isValidDuration(seconds: number): boolean {
  return seconds > 60 && seconds < 600; // 1 dəqiqə ilə 10 dəqiqə arası
}

// === 1. PIPED AXTARIŞI (Yenilənmiş) ===
async function searchPiped(query: string): Promise<string | null> {
  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);
  
  // Daha dəqiq nəticə üçün "Lyrics" əlavə edirik ki, klip səsləri (intro/outro) olmasın
  const searchQuery = `${query} lyrics`; 

  for (const base of shuffled) {
    try {
      // Filteri "all" qoyuruq, "music_songs" çox vaxt nəticə vermir
      const searchUrl = `${base}/api/v1/search?q=${encodeURIComponent(searchQuery)}&filter=all`;
      const res = await safeFetch(searchUrl); // Proxy-siz yoxlayaq, Piped adətən CORS dəstəkləyir
      const results = await res.json();

      if (!Array.isArray(results)) continue;

      // Uyğun videonu tapırıq (Duration vacibdir)
      const video = results.find((v: any) => !v.isShort && isValidDuration(v.duration));
      
      if (!video) continue;

      const streamUrl = `${base}/api/v1/streams/${video.url.split("v=")[1]}`;
      const streamRes = await safeFetch(streamUrl);
      const info = await streamRes.json();

      const audioStreams = info.audioStreams || [];
      
      // m4a və ya yüksək bitrate seçirik
      const bestAudio = audioStreams.find((s: any) => s.mimeType === "audio/mp4") || 
                        audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

      if (bestAudio?.url) {
        console.log(`✅ [Piped] Tapıldı: ${base}`);
        return bestAudio.url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 2. INVIDIOUS AXTARIŞI (YENİ - Ehtiyat Plan) ===
async function searchInvidious(query: string): Promise<string | null> {
  const shuffled = [...INVIDIOUS_INSTANCES].sort(() => Math.random() - 0.5);
  
  console.log(`🔎 Invidious axtarış: ${query}`);

  for (const base of shuffled) {
    try {
      const searchUrl = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await safeFetch(searchUrl);
      const results = await res.json();

      if (!Array.isArray(results) || results.length === 0) continue;

      // İlk uyğun gələn videonu götürürük
      const video = results.find((v: any) => isValidDuration(v.lengthSeconds));
      if (!video) continue;

      // Video detallarını çəkirik
      const videoId = video.videoId;
      const infoUrl = `${base}/api/v1/videos/${videoId}`;
      const infoRes = await safeFetch(infoUrl);
      const info = await infoRes.json();

      // Adaptive formatlardan audio seçirik
      const adaptive = info.adaptiveFormats || [];
      const audio = adaptive
        .filter((f: any) => f.type && f.type.includes("audio"))
        .sort((a: any, b: any) => parseInt(b.bitrate) - parseInt(a.bitrate))[0];

      if (audio?.url) {
        console.log(`✅ [Invidious] Tapıldı: ${base}`);
        return audio.url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 3. iTUNES FALLBACK (Son çarə) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await safeFetch(url);
    const data = await res.json();
    
    if (data.resultCount > 0 && data.results[0].previewUrl) {
      console.log("⚠️ Yalnız iTunes 30s tapıldı");
      return data.results[0].previewUrl;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// === ƏSAS İXRAC EDİLƏN FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const baseQuery = cleanQuery(track.artist, track.title);
  
  // 1. Addım: Piped ilə yoxla (Ən sürətli)
  const pipedUrl = await searchPiped(baseQuery);
  if (pipedUrl) return pipedUrl;

  // 2. Addım: Invidious ilə yoxla (Daha çox server var)
  const invidiousUrl = await searchInvidious(baseQuery);
  if (invidiousUrl) return invidiousUrl;

  // 3. Addım: iTunes (Heç olmasa preview olsun)
  return await searchiTunes(baseQuery);
}
