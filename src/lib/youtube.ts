// src/lib/youtube.ts
import { Track } from "@/types";

// Daha stabil və CORS dostu serverlər
const PIPED_INSTANCES = [
  "https://pipedapi.drgns.space",          // Stabil
  "https://api.piped.projectsegfau.lt",    // Stabil
  "https://piped-api.privacy.com.de",      // Stabil
  "https://api.piped.spot.im",             // Çox sürətli
  "https://pipedapi.kavin.rocks",          // Backup (bəzən 502 verir)
];

async function safeFetch(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 saniyə timeout

  try {
    const res = await fetch(url, { 
      signal: controller.signal,
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });
    clearTimeout(timeoutId);
    if (res.ok) return res;
    throw new Error(`Status: ${res.status}`);
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export async function getYoutubeId(track: Track): Promise<string | null> {
  // Axtarış sorğuları
  const queries = [
    `${track.artist} - ${track.title} official audio`,
    `${track.artist} - ${track.title}`
  ];

  for (const instance of PIPED_INSTANCES) {
    for (const query of queries) {
      try {
        const searchUrl = `${instance}/search?q=${encodeURIComponent(query)}&filter=videos`;
        const searchRes = await safeFetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.items && searchData.items.length > 0) {
          // Video ID-ni götürürük (/watch?v= hissəsini təmizləyirik)
          const videoId = searchData.items[0].url.split("v=")[1];
          // Sadəcə ID-nin düzgünlüyünü yoxlayırıq
          if (videoId && videoId.length > 5) {
            console.log(`[YouTube API] Tapıldı (${instance}):`, videoId);
            return videoId;
          }
        }
      } catch (e) {
        // Xəta olsa, növbəti serverə keç
        // console.warn(`[YouTube API] ${instance} xəta verdi, növbəti yoxlanılır...`);
        continue;
      }
    }
  }
  
  console.warn("[YouTube API] Heç bir serverdən cavab gəlmədi, fallback rejiminə keçilir.");
  return null;
}
