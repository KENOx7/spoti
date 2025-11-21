import { Track } from "@/types";

// --- 1. SAAVN.ME API (Ən stabil Saavn alternativi) ---
async function searchSaavnMe(query: string): Promise<string | null> {
  try {
    console.log(`🔍 Plan A (Saavn.me): ${query}`);
    const response = await fetch(`https://saavn.me/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`);
    
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    if (data.status === "SUCCESS" && data.data.results.length > 0) {
      const song = data.data.results[0];
      // Ən yüksək keyfiyyəti (320kbps) götürürük
      // downloadUrl array olur, sonuncu adətən ən keyfiyyətlidir
      const downloadArray = song.downloadUrl;
      const bestQuality = downloadArray[downloadArray.length - 1];
      
      if (bestQuality && bestQuality.link) {
        console.log("✅ Audio found on Saavn.me");
        return bestQuality.link;
      }
    }
    return null;
  } catch (error) {
    // console.warn("Saavn.me failed:", error);
    return null;
  }
}

// --- 2. INVIDIOUS (YouTube - Proxy olmadan işləyən serverlər) ---
// Bu serverlər CORS-a icazə verir, proxy lazım deyil.
const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://vid.puffyan.us",
  "https://invidious.fdn.fr",
  "https://invidious.perennialte.ch"
];

async function searchInvidious(query: string): Promise<string | null> {
  console.log(`🔍 Plan B (YouTube/Invidious): ${query}`);
  
  // Serverləri qarışdırırıq
  const servers = INVIDIOUS_INSTANCES.sort(() => Math.random() - 0.5);

  for (const base of servers) {
    try {
      // 1. Axtarış
      const searchRes = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();

      if (!searchData || searchData.length === 0) continue;
      
      const videoId = searchData[0].videoId;

      // 2. Video detalları
      const videoRes = await fetch(`${base}/api/v1/videos/${videoId}`);
      if (!videoRes.ok) continue;
      const videoData = await videoRes.json();

      // Səs faylını tapırıq
      if (videoData.adaptiveFormats) {
        const audio = videoData.adaptiveFormats
          .filter((s: any) => s.type.includes("audio"))
          .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
        
        if (audio) {
          console.log(`✅ Audio found on Invidious (${base})`);
          return audio.url;
        }
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// --- 3. iTUNES (Son Çarə - 100% işləyir amma 30 saniyədir) ---
// Bunu axıra saxlayırıq ki, əgər digərləri işləməsə, mahnı heç olmasa oxusun.
async function searchiTunes(query: string): Promise<string | null> {
  try {
    console.log(`🔍 Plan C (iTunes): ${query}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      console.log("⚠️ Only 30s preview found on iTunes");
      return data.results[0].previewUrl;
    }
    return null;
  } catch (e) {
    return null;
  }
}

// --- ƏSAS FUNKSİYA ---
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Axtarış sözünü təmizləyirik
  const cleanTitle = track.title
    .replace(/\(feat\..*?\)/i, "") // feat. hissəsini sil
    .replace(/\(.*?remix.*?\)/i, "Remix") // mötərizəli remix-i sadələşdir
    .trim();
    
  const query = `${cleanTitle} ${track.artist}`;

  // 1. Saavn.me yoxla (Ən yaxşı keyfiyyət)
  const saavnUrl = await searchSaavnMe(query);
  if (saavnUrl) return saavnUrl;

  // 2. YouTube (Invidious) yoxla
  const youtubeUrl = await searchInvidious(query);
  if (youtubeUrl) return youtubeUrl;

  // 3. iTunes yoxla (Ən azından nəsə oxusun)
  const itunesUrl = await searchiTunes(query);
  if (itunesUrl) return itunesUrl;

  console.error("❌ Heç bir mənbə tapılmadı.");
  return null;
}
