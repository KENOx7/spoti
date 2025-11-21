import { Track } from "@/types";

// 1. PROXY SİYAHISI (Biri işləməsə, o birinə keçəcək)
// corsproxy.io daha sürətli və stabil işləyir.
const PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url="
];

// 2. SERVER SİYAHISI (Invidious - Piped-dən daha dözümlüdür)
// Bu serverlər adətən CORS və Proxy sorğularını bloklamır.
const SERVERS = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://vid.puffyan.us",
  "https://invidious.fdn.fr",
  "https://invidious.perennialte.ch",
  "https://yt.artemislena.eu",
  "https://invidious.drgns.space"
];

// Köməkçi funksiya: URL-i Proxy ilə birləşdirib çağırır
async function fetchWithProxy(serverUrl: string, proxyUrl: string) {
  // URL encode edirik
  const fullUrl = `${proxyUrl}${encodeURIComponent(serverUrl)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 saniyə limit

  try {
    const response = await fetch(fullUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Axtarış sorğusu
  const query = `${track.title} ${track.artist}`;

  // Serverləri qarışdırırıq (Hər dəfə fərqli server yoxlasın)
  const shuffledServers = [...SERVERS].sort(() => Math.random() - 0.5);

  // --- ÇARPAZ YOXLAMA MƏNTİQİ ---
  // Hər bir Proxy üçün...
  for (const proxy of PROXIES) {
    // Hər bir Serveri yoxla...
    for (const base of shuffledServers) {
      try {
        console.log(`Trying: Proxy(${proxy}) + Server(${base})`);

        // 1. AXTARIŞ (Invidious API)
        // Invidious API formatı: /api/v1/search
        const searchUrl = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
        const searchData = await fetchWithProxy(searchUrl, proxy);

        if (!searchData || !Array.isArray(searchData) || searchData.length === 0) continue;

        // İlk videonun ID-sini götürürük
        const videoId = searchData[0].videoId;

        // 2. VİDEO DETALLARI (Səs faylını tapmaq üçün)
        const videoUrl = `${base}/api/v1/videos/${videoId}`;
        const videoData = await fetchWithProxy(videoUrl, proxy);

        // Adaptive Formats (Səs faylları burada olur)
        const adaptiveFormats = videoData.adaptiveFormats;
        
        if (adaptiveFormats && adaptiveFormats.length > 0) {
          // Audio/mp4 və ya ən yüksək keyfiyyətli səsi axtarırıq
          const bestAudio = adaptiveFormats
            .filter((s: any) => s.type && s.type.includes("audio"))
            .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

          if (bestAudio) {
            console.log(`✅ SUCCESS! Found audio on ${base}`);
            return bestAudio.url; // Linki tapdıq!
          }
        }

      } catch (error) {
        // Bu kombinasiya işləmədi, sakitcə növbətiyə keçirik
        // console.warn(`Failed: ${proxy} + ${base}`);
        continue;
      }
    }
  }

  console.error("❌ Bütün Proxy və Server kombinasiyaları yoxlandı, nəticə yoxdur.");
  return null;
}
