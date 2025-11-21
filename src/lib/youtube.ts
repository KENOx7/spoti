import { Track } from "@/types";

const DEFAULT_TIMEOUT = 5000; // 5 saniyə limit
const MAX_RETRIES = 1; // 1 dəfə təkrar cəhd

// Timeout üçün helper
function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

// Təhlükəsiz sorğu funksiyası (Timeout + Retry ilə)
async function safeFetch(url: string, opts: any = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const signal = timeoutSignal(timeout);
      const res = await fetch(url, { ...opts, signal });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res;
    } catch (err: any) {
      const last = attempt === MAX_RETRIES;
      if (last) throw err;
      // Qısa gözləmə (backoff)
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error("Fetch failed");
}

// --- 1) Saavn.me axtarışı (Plan A - Yüksək Keyfiyyət) ---
async function searchSaavnMe(query: string): Promise<string | null> {
  try {
    console.log(`🔍 Plan A — Saavn.me: "${query}"`);
    const url = `https://saavn.me/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;
    const res = await safeFetch(url);
    const data = await res.json();

    if (data?.status === "SUCCESS" && Array.isArray(data?.data?.results) && data.data.results.length > 0) {
      const song = data.data.results[0];
      const urls = song?.downloadUrl || song?.download_urls || null;
      
      if (Array.isArray(urls) && urls.length > 0) {
        // Sonuncu adətən ən yüksək keyfiyyətdir (320kbps)
        const candidate = urls[urls.length - 1]?.link || urls[urls.length - 1];
        
        // Əgər string-dirsə qaytar, obyektirsə url sahəsini qaytar
        if (typeof candidate === 'string') {
            console.log(`[Saavn.me] Tapıldı: ${candidate}`);
            return candidate;
        }
        if (candidate?.url) {
            console.log(`[Saavn.me] Tapıldı: ${candidate.url}`);
            return candidate.url;
        }
      }
      
      if (song?.url) return song.url;
    }
    return null;
  } catch (err) {
    // console.warn(`[searchSaavnMe] error:`, err);
    return null;
  }
}

// --- 2) Invidious axtarışı (Plan B - YouTube) ---
const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://vid.puffyan.us",
  "https://invidious.fdn.fr",
  "https://invidious.perennialte.ch",
  "https://yt.artemislena.eu"
];

async function searchInvidious(query: string): Promise<string | null> {
  console.log(`🔍 Plan B — Invidious: "${query}"`);
  
  // Serverləri qarışdırırıq ki, yük paylansın
  const instances = [...INVIDIOUS_INSTANCES].sort(() => Math.random() - 0.5);

  for (const inst of instances) {
    try {
      const searchUrl = `${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await safeFetch(searchUrl, {}, 4000); // YouTube üçün qısa timeout
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const vidId = data[0].videoId;
        if (!vidId) continue;

        // Videonun detallarını alırıq
        const infoRes = await safeFetch(`${inst}/api/v1/videos/${vidId}`, {}, 4000);
        const info = await infoRes.json();

        // Audio formatını axtarırıq
        const adaptive = info.adaptiveFormats || [];
        const audio = adaptive
          .filter((f: any) => f.type && f.type.includes("audio"))
          .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0]; // Ən yüksək bitrate

        if (audio?.url) {
          console.log(`[Invidious:${inst}] Tapıldı`);
          return audio.url;
        }
      }
    } catch (innerErr) {
      continue; // Bu server işləmədi, növbətiyə keç
    }
  }
  return null;
}

// --- 3) iTunes Axtarışı (Plan C - 30s Preview) ---
async function searchiTunes(query: string): Promise<string | null> {
  try {
    console.log(`🔍 Plan C — iTunes: "${query}"`);
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`;
    const res = await safeFetch(url);
    const data = await res.json();
    
    if (data?.results?.length > 0 && data.results[0].previewUrl) {
      console.log(`[iTunes] Preview tapıldı`);
      return data.results[0].previewUrl;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// --- Əsas funksiya ---
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Sorğunun təmizlənməsi
  const cleanTitle = track.title.replace(/\(.*?\)/g, "").trim(); // Mötərizələri silirik
  const query = `${cleanTitle} ${track.artist}`;

  // 1) Saavn yoxla
  const saavn = await searchSaavnMe(query);
  if (saavn) return saavn;

  // 2) Invidious yoxla
  const inv = await searchInvidious(query);
  if (inv) return inv;

  // 3) iTunes yoxla
  const it = await searchiTunes(query);
  if (it) return it;

  console.error("Mahnı heç bir mənbədə tapılmadı.");
  return null;
}
