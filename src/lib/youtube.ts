import { Track } from "@/types";

const DEFAULT_TIMEOUT = 8000; // 8 saniyə (çox gözləməsin)
const MAX_RETRIES = 2; // 2 dəfə təkrar yoxlasın

// CORS Proxy (Brauzer bloklamasın deyə)
const CORS_PROXY = "https://corsproxy.io/?";

// Stabil Piped Serverləri (2025 Yenilənmiş)
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.ot.ax",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.adminforge.de",
  "https://api.piped.privacydev.net",
  "https://pipedapi.ducks.party"
];

// Timeout helper
function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

// Təhlükəsiz fetch
async function safeFetch(url: string, opts: any = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const signal = timeoutSignal(timeout);
      const res = await fetch(url, { ...opts, signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err: any) {
      if (attempt === MAX_RETRIES) throw err;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error("Fetch failed");
}

// Axtarış mətnini təmizləyən funksiya
function cleanQuery(artist: string, title: string): string {
  // Artist və Title-dan lazımsız simvolları təmizləyirik
  const cleanArtist = artist.replace(/feat\..*|ft\..*/i, "").trim();
  const cleanTitle = title
    .replace(/\(.*?\)/g, "") // Mötərizələri silir: (Official Video)
    .replace(/\[.*?\]/g, "") // Kvadrat mötərizələri silir: [4K]
    .replace(/feat\..*|ft\..*|official|video|audio|lyrics|remastered/gi, "") // Lazımsız sözlər
    .trim();

  // SİZİN İSTƏYİNİZ: Artist - Title formatı
  return `${cleanArtist} - ${cleanTitle}`;
}

// === 1. PIPED AXTARIŞI (TAM Audio) ===
async function searchPiped(track: Track): Promise<string | null> {
  // Sorğunu hazırlayırıq
  let query = cleanQuery(track.artist, track.title);
  
  // YouTube-da dəqiq musiqi tapması üçün sonuna "audio" əlavə edirik
  // Amma axtarışda Artist öndə gəlir
  const finalQuery = `${query} audio`; 
  
  console.log(`🔥 PIPED Axtarış: "${finalQuery}"`);

  // Serverləri qarışdırırıq
  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // 1. Axtarış Sorğusu (Proxy ilə)
      // filter=music_songs vacibdir ki, video yox musiqi gəlsin
      const searchUrl = `${CORS_PROXY}${encodeURIComponent(`${base}/api/v1/search?q=${finalQuery}&filter=music_songs`)}`;
      
      const searchRes = await safeFetch(searchUrl);
      const results = await searchRes.json();

      if (!Array.isArray(results) || results.length === 0) continue;

      // İlk nəticənin ID-sini götürürük
      const videoId = results[0].url.split("watch?v=")[1] || results[0].videoId;
      if (!videoId) continue;

      // 2. Səs Linkini Almaq (Proxy ilə)
      const streamUrl = `${CORS_PROXY}${encodeURIComponent(`${base}/api/v1/streams/${videoId}`)}`;
      const streamRes = await safeFetch(streamUrl);
      const info = await streamRes.json();

      // Audio axınlarını tapırıq
      const audioStreams = info.audioStreams || [];
      
      // .m4a formatını tapırıq (iPhone və Web üçün ən yaxşısı)
      const m4a = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
      
      // Ən yüksək keyfiyyətli səsi seçirik
      const bestAudio = m4a || audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

      if (bestAudio?.url) {
        console.log(`✅ [Piped:${base}] TAM mahnı tapıldı!`);
        return bestAudio.url; 
      }

    } catch (e) {
      // console.warn(`Server xətası: ${base}`);
      continue;
    }
  }
  return null;
}

// === 2. iTUNES FALLBACK (30s Preview) ===
async function searchiTunes(track: Track): Promise<string | null> {
  try {
    const query = cleanQuery(track.artist, track.title);
    console.log(`🍎 iTunes Fallback: "${query}"`);
    
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    
    const res = await safeFetch(url);
    const data = await res.json();
    
    if (data.resultCount > 0 && data.results[0].previewUrl) {
      console.log("⚠️ iTunes 30s preview tapıldı");
      return data.results[0].previewUrl;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // 1. Piped yoxla (Tam mahnı)
  const pipedUrl = await searchPiped(track);
  if (pipedUrl) return pipedUrl;

  // 2. iTunes yoxla (Ən azı nəsə oxusun)
  const itunesUrl = await searchiTunes(track);
  if (itunesUrl) return itunesUrl;

  console.error("❌ Mahnı heç bir yerdə tapılmadı.");
  return null;
}
