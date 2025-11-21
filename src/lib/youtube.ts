import { Track } from "@/types";

// --- 1. SAAVN API (Ən təmiz səs) ---
async function searchSaavn(query: string): Promise<string | null> {
  try {
    // Saavn axtarışı
    const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.success && data.data.results.length > 0) {
      // İlk nəticəni yoxlayırıq
      const song = data.data.results[0];
      
      // Yükləmə linklərini yoxlayırıq (320kbps və ya 160kbps)
      const downloadLink = song.downloadUrl.find((url: any) => url.quality === "320kbps") || 
                           song.downloadUrl.find((url: any) => url.quality === "160kbps") ||
                           song.downloadUrl[song.downloadUrl.length - 1];
                           
      if (downloadLink && downloadLink.url) {
        console.log("✅ Audio found on Saavn:", song.name);
        return downloadLink.url;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// --- 2. YOUTUBE API (Ehtiyat Plan - Proxy ilə) ---
// "thingproxy" daha stabildir və CORS-u keçir
const PROXY_URL = "https://thingproxy.freeboard.io/fetch/";
const INVIDIOUS_INSTANCE = "https://inv.tux.pizza"; // Ən stabil Invidious serveri

async function searchYouTube(query: string): Promise<string | null> {
  try {
    console.log("⚠️ Saavn tapmadı, YouTube yoxlanılır...");
    
    // 1. Axtarış (Proxy üzərindən)
    const searchUrl = `${PROXY_URL}${INVIDIOUS_INSTANCE}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
    const searchRes = await fetch(searchUrl);
    
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    if (!searchData || searchData.length === 0) return null;
    
    const videoId = searchData[0].videoId;

    // 2. Səs faylını tapmaq
    const videoUrl = `${PROXY_URL}${INVIDIOUS_INSTANCE}/api/v1/videos/${videoId}`;
    const videoRes = await fetch(videoUrl);
    
    if (!videoRes.ok) return null;
    const videoData = await videoRes.json();

    // Ən yaxşı səs formatını seçirik
    const adaptiveFormats = videoData.adaptiveFormats;
    if (adaptiveFormats && adaptiveFormats.length > 0) {
      const bestAudio = adaptiveFormats
        .filter((s: any) => s.type && s.type.includes("audio"))
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

      if (bestAudio) {
        console.log("✅ Audio found on YouTube:", videoData.title);
        return bestAudio.url;
      }
    }
    return null;
  } catch (error) {
    console.warn("YouTube search failed:", error);
    return null;
  }
}

// --- ƏSAS FUNKSİYA ---
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Axtarış sorğusunu təmizləyirik (mötərizələri silirik)
  // Məsələn: "Song (Remix)" -> "Song Remix" (Daha yaxşı nəticə verir)
  const cleanTitle = track.title.replace(/\([^)]*\)/g, "").trim();
  const query = `${cleanTitle} ${track.artist}`;
  
  console.log(`🔍 Searching: ${query}`);

  // 1. PLAN A: Saavn
  const saavnUrl = await searchSaavn(query);
  if (saavnUrl) return saavnUrl;

  // 2. PLAN A (Alternativ): Sadəcə Mahnı adı ilə Saavn axtarışı
  // Bəzən Artist adı mane olur, ona görə tək adla yoxlayırıq
  const saavnUrlSimple = await searchSaavn(track.title);
  if (saavnUrlSimple) return saavnUrlSimple;

  // 3. PLAN B: YouTube (Proxy ilə)
  const youtubeUrl = await searchYouTube(query);
  if (youtubeUrl) return youtubeUrl;

  console.error("❌ Mahnı tapılmadı (iTunes istifadə edilmədi).");
  return null;
}
