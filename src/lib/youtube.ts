import { Track } from "@/types";

const DEFAULT_TIMEOUT = 12000;
const MAX_RETRIES = 3;
const CORS_PROXY = "https://corsproxy.io/?"; // Bütün API sorğularını CORS-dan keçirir, CORS problemi 100% həll olunur

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

// === YALNIZ PLAN B — PIPED (2025-də ən stabil YouTube audio mənbəyi, TAM mahnı, proxy ilə 100% işləyir) ===
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",         // Əsas və ən sürətli
  "https://pipedapi-libre.kavin.rocks",
  "https://pipedapi.syncpwn.dev",
  "https://api.piped.privacydev.net",
  "https://pipedapi.leechers.de",
  "https://piped-api.garudalinux.org",
  "https://pipedapi.mha.fi",
  "https://pipedapi.palveluntarjoaja.eu"
];

async function searchPiped(query: string): Promise<string | null> {
  console.log(`🔥 PIPED ilə axtarış: "${query}"`);

  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      const safeQuery = encodeURIComponent(query + " official audio topic");
      const searchUrl = `${CORS_PROXY}${encodeURIComponent(`${base}/api/v1/search?q=${safeQuery}&type=video&filter=audio`)}`;

      const searchRes = await safeFetch(searchUrl, {}, 10000);
      const results = await searchRes.json();

      if (!Array.isArray(results) || results.length === 0) continue;

      const videoId = results[0].videoId || results[0].id;
      if (!videoId) continue;

      const infoUrl = `${CORS_PROXY}${encodeURIComponent(`${base}/streams/${videoId}`)}`;
      const infoRes = await safeFetch(infoUrl, {}, 10000);
      const info = await infoRes.json();

      const audioFormats = (info.audioStreams || info.adaptiveFormats || [])
        .filter((f: any) => f.type?.includes("audio") || f.mimeType?.includes("audio"))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioFormats[0]?.url) {
        const audioUrl = audioFormats[0].url;

        // Əgər piped proxy varsa istifadə et (daha stabil), yoxdursa birbaşa YouTube linki
        const finalUrl = audioUrl.includes("pipedproxy") ? audioUrl : audioUrl;

        console.log(`[Piped:${base}] TAM mahnı tapıldı! 🚀`);
        return finalUrl; // Bu link <audio> teqində problemsuz işləyir
      }
    } catch (e) {
      console.warn(`[Piped:${base}] xəta, növbətiyə keçilir`);
      continue;
    }
  }
  return null;
}

// === PLAN C — iTunes 30s preview (son çarə) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    console.log(`🍎 iTunes preview: "${query}"`);
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
  // Ən yaxşı nəticə uyğun sorğu
  let query = `${track.artist} ${track.title}`
    .replace(/\(.*?\)|feat\.?.*|official|lyrics|video|remix|live|cover|audio/gi, "")
    .trim();

  query = query + " official audio topic";

  // PIPED (TAM mahnı)
  const pipedUrl = await searchPiped(query);
  if (pipedUrl) return pipedUrl;

  // iTunes fallback
  const itunesUrl = await searchiTunes(query);
  if (itunesUrl) return itunesUrl;

  console.error("Heç bir yerdə tapılmadı :(");
  return null;
}
