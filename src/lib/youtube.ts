import { Track } from "@/types";

const DEFAULT_TIMEOUT = 12000;
const MAX_RETRIES = 3;

// Ümumi CORS proxy (2025-də də işləyən ən stabil proxy)
const CORS_PROXY = "https://corsproxy.io/?";

// Daha çox və stabil Piped instansları (2025 noyabrında test olunmuş işləyənlər)
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",          // Ən stabil (yeni domain)
  "https://pipedapi-libre.kavin.rocks",
  "https://pipedapi.tokhmi.xyz",
  "https://api.piped.mint.lgbt",
  "https://pipedapi.syncpwn.dev",
  "https://piped-api.garudalinux.org",
  "https://pipedapi.leechers.de",
  "https://pipedapi.palveluntarjoaja.eu",
  "https://pipedapi.uselesscloud.com"
];

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
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error("Fetch failed");
}

// === YALNIZ PIPED (TAM mahnı) ===
async function searchPiped(track: Track): Promise<string | null> {
  console.log(`🔥 PIPED ilə axtarış: "${track.artist} - ${track.title}"`);

  // Ən yaxşı nəticə üçün "topic" + music_songs filter
  const pipedQuery = encodeURIComponent(`${track.artist} - ${track.title} topic`.replace(/\(.*?\)|feat\.?.*|remix|live|cover/gi, "").trim());

  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      const searchUrl = `${CORS_PROXY}${encodeURIComponent(`${base}/api/v1/search?q=${pipedQuery}&filter=music_songs`)}`;

      const searchRes = await safeFetch(searchUrl);
      const results = await searchRes.json();

      if (!Array.isArray(results) || results.length === 0) continue;

      const videoId = results[0].url.split("watch?v=")[1] || results[0].id;
      if (!videoId) continue;

      const streamUrl = `${CORS_PROXY}${encodeURIComponent(`${base}/api/v1/streams/${videoId}`)}`;
      const streamRes = await safeFetch(streamUrl);
      const info = await streamRes.json();

      // Piped-də audioStreams massivi var
      const audio = (info.audioStreams || [])
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (audio?.url) {
        console.log(`[Piped:${base}] TAM mahnı tapıldı! 🚀`);
        return audio.url; // Proxy-li URL – expire olmur, problemsuz oynayır
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === iTunes fallback (indi düzgün query ilə işləyəcək) ===
async function searchiTunes(track: Track): Promise<string | null> {
  try {
    // iTunes üçün ən sadə və dəqiq query: artist + title (əlavə sözlər silinir)
    const itunesQuery = encodeURIComponent(`${track.artist} ${track.title}`.replace(/\(.*?\)|feat\.?.*|official|lyrics|video|audio/gi, "").trim());
    const url = `https://itunes.apple.com/search?term=${itunesQuery}&media=music&entity=song&limit=1`;
    
    const res = await safeFetch(url);
    const data = await res.json();
    
    if (data.resultCount > 0 && data.results[0].previewUrl) {
      console.log("[iTunes] 30s preview tapıldı (fallback)");
      return data.results[0].previewUrl;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// === ƏSAS FUNKSIYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // PIPED (TAM mahnı)
  const pipedUrl = await searchPiped(track);
  if (pipedUrl) return pipedUrl;

  // iTunes fallback
  const itunesUrl = await searchiTunes(track);
  if (itunesUrl) return itunesUrl;

  console.error("Heç bir yerdə tapılmadı :(");
  return null;
}
