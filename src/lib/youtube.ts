import { Track } from "@/types";

// === AYARLAR ===
const SEARCH_TIMEOUT = 4000;

// === 1. AXTARIŞ SERVERLƏRİ (Yalnız ID tapmaq üçün) ===
// Bu serverlər sadəcə "Artist - Mahnı" yazanda bizə Video ID-sini verir.
const SEARCH_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.ot.ax",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.adminforge.de"
];

// === 2. "CONVERTER" SERVERLƏRİ (Axın üçün) ===
// Bu serverlər ID-ni alıb, birbaşa Audio Faylına (stream) çevirir.
// Bu linklər brauzerdə birbaşa açılır və CORS xətası vermir.
const STREAM_DOMAINS = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://inv.bp.projectsegfau.lt",
  "https://vid.puffyan.us",
  "https://invidious.fdn.fr"
];

// === KÖMƏKÇİ FUNKSİYALAR ===
function cleanQuery(artist: string, title: string): string {
  return `${artist} - ${title}`
    .replace(/feat\.|ft\.|official|video|audio|lyrics/gi, "") // Lazımsız sözləri silirik
    .trim();
}

// Sadə fetch (timeout ilə)
async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// === ADDIM 1: YOUTUBE ID-SİNİ TAP ===
async function findYoutubeVideoId(query: string): Promise<string | null> {
  const finalQuery = `${query} audio`; // "Audio" yazırıq ki, klip yox mahnı versiyası gəlsin

  // Serverləri qarışdırırıq ki, yük düşməsin
  const shuffled = [...SEARCH_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // Piped API axtarış sorğusu
      const url = `${base}/api/v1/search?q=${encodeURIComponent(finalQuery)}&filter=all`;
      const res = await fetchWithTimeout(url);
      
      if (!res.ok) continue;

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) continue;

      // Filtrasiya: Shorts olmasın, 1 dəqiqədən uzun, 15 dəqiqədən qısa olsun
      const video = data.find((v: any) => 
        !v.isShort && 
        v.duration > 60 && 
        v.duration < 900 
      );

      if (video) {
        const videoId = video.url.split("v=")[1];
        console.log(`🎯 ID Tapıldı [${base}]: ${videoId}`);
        return videoId;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === ADDIM 2: AUDIO LİNKİNİ DÜZƏLT (CONVERTER MƏNTİQİ) ===
async function getStreamUrl(videoId: string): Promise<string | null> {
  // Invidious-un xüsusi bir link formatı var.
  // Bu linkə girən kimi o, faylı çevirib sənə verir ("latest_version" API).
  // itag=140 -> Bu kod "m4a audio" deməkdir (yüksək keyfiyyət).
  
  const shuffled = [...STREAM_DOMAINS].sort(() => Math.random() - 0.5);

  for (const domain of shuffled) {
    try {
      // Bu URL birbaşa mp3/m4a faylı kimi işləyir
      const magicUrl = `${domain}/latest_version?id=${videoId}&itag=140&local=true`;
      
      // Yoxlayaq görək link işləyirmi (HEAD sorğusu ilə)
      const check = await fetch(magicUrl, { method: "HEAD" });
      
      if (check.ok) {
        console.log(`✅ "Converter" Linki Hazırdır: ${domain}`);
        return magicUrl;
      }
    } catch (e) {
      // console.log(`${domain} cavab vermədi, növbəti...`);
      continue;
    }
  }
  return null;
}

// === 3. EHTİYAT PLAN: ITUNES ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results[0]?.previewUrl || null;
  } catch (e) {
    return null;
  }
}

// === ƏSAS İŞƏ SALAN FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const baseQuery = cleanQuery(track.artist, track.title);
  console.log(`🚀 Başlayır: "${baseQuery}"`);

  // 1. Video ID-ni tapırıq
  const videoId = await findYoutubeVideoId(baseQuery);

  if (videoId) {
    // 2. Onu "Converter" linkinə çeviririk
    const streamUrl = await getStreamUrl(videoId);
    if (streamUrl) return streamUrl;
  }

  // 3. Heç nə alınmasa, köhnə qayda iTunes
  console.warn("⚠️ Tam versiya tapılmadı, iTunes işə düşür...");
  return await searchiTunes(baseQuery);
}
