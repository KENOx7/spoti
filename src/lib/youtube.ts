import { Track } from "@/types";

// CORS icazəsi verən stabil Invidious serverləri
const SEARCH_SERVERS = [
  "https://inv.tux.pizza",
  "https://invidious.projectsegfau.lt",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
  "https://invidious.fdn.fr"
];

// Timeout helper
const fetchWithTimeout = async (url: string, ms = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

// Sadəcə Video ID-ni tapır
export async function getYoutubeVideoId(track: Track): Promise<string | null> {
  const query = `${track.artist} - ${track.title}`;
  console.log(`🔍 Video Axtarılır: "${query}"`);

  // Serverləri qarışdırırıq
  const shuffled = [...SEARCH_SERVERS].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    try {
      // Invidious Search API
      const url = `${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`;
      const res = await fetchWithTimeout(url);
      
      if (!res.ok) continue;

      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const videoId = data[0].videoId;
        console.log(`✅ Video Tapıldı: ${videoId}`);
        // Tam YouTube linkini qaytarırıq
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}
