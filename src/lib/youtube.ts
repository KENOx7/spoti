import { Track } from "@/types";

// === AYARLAR ===
const TIMEOUT_MS = 6000;

// === İŞLƏK SERVERLƏR (2025) ===
// Bu serverlər birbaşa MP3 axını verir və CORS bloklamır.
const DIRECT_INSTANCES = [
  "https://inv.tux.pizza",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
  "https://invidious.projectsegfau.lt",
  "https://invidious.fdn.fr",
  "https://invidious.perennialte.ch",
  "https://invidious.drgns.space"
];

// Timeout helper
const fetchWithTimeout = async (url: string) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

// Sorğunu təmizləyən funksiya
function cleanQuery(artist: string, title: string): string {
  return `${artist} - ${title}`
    .replace(/feat\.|ft\.|official|video|audio|lyrics/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// === ADDIM 1: MAHNINI TAP (ID) ===
async function findVideoId(query: string): Promise<string | null> {
  console.log(`🔍 Axtarış: "${query}"`);
  
  // Serverləri qarışdırırıq
  const shuffled = [...DIRECT_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // Invidious API axtarışı
      const url = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetchWithTimeout(url);
      
      if (!res.ok) continue;

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      // İlk nəticənin ID-sini götürürük
      const videoId = data[0].videoId;
      if (videoId) {
        console.log(`🎯 ID Tapıldı [${base}]: ${videoId}`);
        // Serveri yadda saxlayırıq ki, stream üçün də eynisini işlədək
        return JSON.stringify({ id: videoId, server: base }); 
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === ADDIM 2: STREAM LİNKİ ===
async function getStreamUrl(idData: string): Promise<string | null> {
  const { id, server } = JSON.parse(idData);
  
  try {
    // Videonun detallarını çəkirik
    const url = `${server}/api/v1/videos/${id}`;
    const res = await fetchWithTimeout(url);
    if(!res.ok) return null;
    
    const data = await res.json();
    const adaptive = data.adaptiveFormats || [];

    // Audio formatını axtarırıq (audio/mp4 və ya audio/webm)
    // Bitrate-ə görə ən keyfiyyətlisini seçirik
    const audio = adaptive
        .filter((s: any) => s.type.includes("audio"))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    if (audio?.url) {
        console.log(`✅ Stream Hazırdır: ${audio.url}`);
        return audio.url;
    }
  } catch (e) {
    console.warn("Stream alınmadı");
  }
  return null;
}

// === 3. ITUNES FALLBACK (Ehtiyat) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`);
    const data = await res.json();
    if (data.results?.[0]?.previewUrl) {
        console.log(`🎵 iTunes Preview: ${data.results[0].trackName}`);
        return data.results[0].previewUrl;
    }
    return null;
  } catch (e) { return null; }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const baseQuery = cleanQuery(track.artist, track.title);
  
  // 1. ID Tap
  const idData = await findVideoId(baseQuery);

  if (idData) {
    // 2. Stream Linki Tap
    const streamUrl = await getStreamUrl(idData);
    if (streamUrl) return streamUrl;
  }

  // 3. Fallback
  console.warn("⚠️ iTunes Fallback");
  return await searchiTunes(baseQuery);
}