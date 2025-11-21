import { Track } from "@/types";

const TIMEOUT = 5000;

// === 1. AXTARIŞ SERVERLƏRİ (ID tapmaq üçün) ===
// Bu serverlər CORS-a icazə verir, Proxy lazım deyil.
const SEARCH_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
  "https://invidious.drgns.space",
  "https://invidious.fdn.fr"
];

// === 2. STREAM SERVERLƏRİ (Cobalt - Yüksək Keyfiyyət) ===
const COBALT_INSTANCES = [
  "https://cobalt.sipmaker.net",
  "https://api.cobalt.7io.org",
  "https://co.wuk.sh",
  "https://cobalt.tools",
  "https://api.cobalt.biz"
];

// Timeout helper
const fetchWithTimeout = async (url: string, options: any = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

function cleanQuery(artist: string, title: string): string {
  return `${artist} - ${title}`
    .replace(/feat\.|ft\.|official|video|audio|lyrics/gi, "")
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .trim();
}

// === ADDIM 1: ID TAPMAQ (Direct API) ===
async function findVideoId(query: string): Promise<string | null> {
  console.log(`🔍 Axtarış: "${query}"`);
  
  // Serverləri qarışdırırıq
  const shuffled = [...SEARCH_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // Invidious API (Proxy-siz, birbaşa)
      const url = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetchWithTimeout(url);
      
      if (!res.ok) continue;

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      // İlk nəticəni götürürük
      const videoId = data[0].videoId;
      if (videoId) {
        console.log(`🎯 ID Tapıldı [${base}]: ${videoId}`);
        return videoId;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === ADDIM 2: STREAM LİNKİ (Cobalt + Fallback) ===
async function getStreamUrl(videoId: string): Promise<string | null> {
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // 1. COBALT (Ən təmiz səs)
  for (const instance of COBALT_INSTANCES) {
    try {
      const res = await fetchWithTimeout(`${instance}/api/json`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: targetUrl,
          isAudioOnly: true,
          aFormat: "mp3"
        })
      });

      const data = await res.json();
      if (data.url) {
        console.log(`✅ Stream (Cobalt): ${instance}`);
        return data.url;
      }
    } catch (e) { continue; }
  }

  // 2. INVIDIOUS FALLBACK (Əgər Cobalt işləməsə)
  // Birbaşa Invidious-dan audio axınını götürürük
  for (const base of SEARCH_INSTANCES) {
    try {
        const res = await fetchWithTimeout(`${base}/api/v1/videos/${videoId}`);
        if(!res.ok) continue;
        const data = await res.json();
        
        const adaptive = data.adaptiveFormats || [];
        const audio = adaptive
            .filter((s: any) => s.type.includes("audio"))
            .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];
            
        if (audio?.url) {
            console.log(`✅ Stream (Invidious Fallback): ${base}`);
            return audio.url;
        }
    } catch(e) { continue; }
  }

  return null;
}

// === 3. ITUNES (Son çarə) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`);
    const data = await res.json();
    return data.results?.[0]?.previewUrl || null;
  } catch (e) { return null; }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const baseQuery = cleanQuery(track.artist, track.title);
  
  // 1. ID Tap
  const videoId = await findVideoId(baseQuery);

  if (videoId) {
    // 2. Stream Linki Tap
    const streamUrl = await getStreamUrl(videoId);
    if (streamUrl) return streamUrl;
  }

  // 3. Fallback
  console.warn("⚠️ iTunes Fallback");
  return await searchiTunes(baseQuery);
}
