import { Track } from "@/types";

// === KONFİQURASİYA ===
const DEFAULT_TIMEOUT = 6000; // 6 saniyə
const MAX_RETRIES = 1;

// ƏN VACİB HİSSƏ: Proxy URL
const CORS_PROXY = "https://corsproxy.io/?";

// 2025-ci il üçün ən stabil serverlər (Yoxlanılıb)
const PIPED_INSTANCES = [
  "https://api.piped.ot.ax",        // Çox sürətli
  "https://pipedapi.kavin.rocks",   // Klassik (bəzən donur)
  "https://api.piped.yt",           // Stabil
  "https://pipedapi.adminforge.de", // Almaniya serveri
  "https://api.piped.projectsegfau.lt"
];

const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://inv.bp.projectsegfau.lt",
  "https://vid.puffyan.us" // Bəzən 502 verir, amma populyardır
];

// === KÖMƏKÇİ FUNKSİYALAR ===

function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

// Bütün URL-ləri Proxy ilə örtən funksiya
function proxify(url: string): string {
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
}

async function safeFetch(url: string, opts: any = {}, timeout = DEFAULT_TIMEOUT): Promise<Response> {
  try {
    const signal = timeoutSignal(timeout);
    // Burada URL-i həmişə proxify edirik
    const res = await fetch(proxify(url), { ...opts, signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    throw err;
  }
}

function cleanQuery(artist: string, title: string): string {
  const cleanArtist = artist.replace(/feat\.|ft\./gi, "").trim();
  let cleanTitle = title
    .replace(/\(.*\)/g, "") 
    .replace(/\[.*\]/g, "")
    .replace(/official video|video|audio|lyrics/gi, "") // Təmizləyirik, sonra özümüz əlavə edəcəyik
    .trim();
  
  return `${cleanArtist} - ${cleanTitle}`;
}

// Videonun müddətini yoxlayır (1 dəq - 12 dəq arası)
function isValidDuration(seconds: number): boolean {
  return seconds > 60 && seconds < 720; 
}

// === 1. PIPED AXTARIŞI (PROXY İLƏ) ===
async function searchPiped(query: string): Promise<string | null> {
  const shuffled = [...PIPED_INSTANCES].sort(() => Math.random() - 0.5);
  const searchQuery = `${query} audio`; // "audio" sözü rəsmi səsi tapmağa kömək edir

  for (const base of shuffled) {
    try {
      // 1. Axtarış
      const searchUrl = `${base}/api/v1/search?q=${encodeURIComponent(searchQuery)}&filter=all`;
      const res = await safeFetch(searchUrl);
      const results = await res.json();

      if (!Array.isArray(results)) continue;

      // Uyğun videonu tapırıq
      const video = results.find((v: any) => !v.isShort && isValidDuration(v.duration));
      if (!video) continue;

      const videoId = video.url.split("v=")[1];

      // 2. Stream Linki (Bu da Proxy ilə çağırılmalıdır)
      const streamUrl = `${base}/api/v1/streams/${videoId}`;
      const streamRes = await safeFetch(streamUrl);
      const info = await streamRes.json();

      const audioStreams = info.audioStreams || [];
      
      // m4a (iPhone/Web üçün ən yaxşı) və ya yüksək bitrate
      const bestAudio = audioStreams.find((s: any) => s.mimeType === "audio/mp4") || 
                        audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

      if (bestAudio?.url) {
        console.log(`✅ [Piped] Tapıldı (${base}): ${videoId}`);
        return bestAudio.url;
      }
    } catch (e) {
      // console.warn(`Server xətası (${base}):`, e);
      continue; // Sakitcə növbəti serverə keç
    }
  }
  return null;
}

// === 2. INVIDIOUS AXTARIŞI (PROXY İLƏ) ===
async function searchInvidious(query: string): Promise<string | null> {
  const shuffled = [...INVIDIOUS_INSTANCES].sort(() => Math.random() - 0.5);
  const searchQuery = `${query} lyrics`; // Invidious üçün "lyrics" daha yaxşı işləyir

  for (const base of shuffled) {
    try {
      // 1. Axtarış
      const searchUrl = `${base}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`;
      const res = await safeFetch(searchUrl);
      const results = await res.json();

      if (!Array.isArray(results) || results.length === 0) continue;

      const video = results.find((v: any) => isValidDuration(v.lengthSeconds));
      if (!video) continue;

      // 2. Video Detalları
      const infoUrl = `${base}/api/v1/videos/${video.videoId}`;
      const infoRes = await safeFetch(infoUrl);
      const info = await infoRes.json();

      // Adaptive formatlardan audio seçirik
      const adaptive = info.adaptiveFormats || [];
      const audio = adaptive
        .filter((f: any) => f.type && f.type.includes("audio"))
        .sort((a: any, b: any) => parseInt(b.bitrate || "0") - parseInt(a.bitrate || "0"))[0];

      if (audio?.url) {
        console.log(`✅ [Invidious] Tapıldı (${base}): ${video.videoId}`);
        return audio.url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 3. iTUNES FALLBACK ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    // iTunes CORS dəstəkləyir, proxy-ə ehtiyac yoxdur, amma safeFetch proxy əlavə edir. 
    // iTunes birbaşa fetch ilə işləyə bilər.
    const res = await fetch(url); 
    const data = await res.json();
    
    if (data.resultCount > 0 && data.results[0].previewUrl) {
      console.log("⚠️ Fallback: iTunes 30s preview");
      return data.results[0].previewUrl;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const baseQuery = cleanQuery(track.artist, track.title);
  console.log(`🔍 Axtarılır: "${baseQuery}"`);

  // 1. Piped (Ən keyfiyyətli)
  const pipedUrl = await searchPiped(baseQuery);
  if (pipedUrl) return pipedUrl;

  // 2. Invidious (Ən geniş baza)
  const invidiousUrl = await searchInvidious(baseQuery);
  if (invidiousUrl) return invidiousUrl;

  // 3. iTunes (Ən azından səssiz qalmasın)
  return await searchiTunes(baseQuery);
}
