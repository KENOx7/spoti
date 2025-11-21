import { Track } from "@/types";

// Ehtiyat üçün birbaşa brauzerdən işləyəcək serverlər (CORS açıq olanlar)
const DIRECT_FALLBACK_SERVERS = [
  "https://api.piped.ot.ax",
  "https://pipedapi.kavin.rocks",
  "https://api.piped.projectsegfau.lt"
];

// Köməkçi funksiya: Birbaşa brauzerdən axtarış (Plan B)
async function searchDirectly(track: Track): Promise<string | null> {
  const query = `${track.title} ${track.artist} official audio`;
  
  for (const base of DIRECT_FALLBACK_SERVERS) {
    try {
      console.log(`Plan B: Trying direct fetch from ${base}`);
      
      // 1. Axtarış
      const searchRes = await fetch(`${base}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
      if (!searchRes.ok) continue;
      const searchData = await searchRes.json();
      if (!searchData.items || searchData.items.length === 0) continue;
      
      const videoId = searchData.items[0].url.split("/watch?v=")[1];

      // 2. Stream
      const streamRes = await fetch(`${base}/streams/${videoId}`);
      if (!streamRes.ok) continue;
      const streamData = await streamRes.json();

      const audioStreams = streamData.audioStreams;
      if (audioStreams && audioStreams.length > 0) {
        const m4a = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
        return m4a ? m4a.url : audioStreams[0].url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  try {
    const query = `${track.title} ${track.artist} official audio`;
    console.log("Plan A: Asking Vercel API...");

    // --- PLAN A: VERCEL API (Invidious) ---
    const searchRes = await fetch(`/api/youtube?type=search&q=${encodeURIComponent(query)}`);
    
    if (!searchRes.ok) {
      throw new Error("API Error"); // Plan B-yə keç
    }
    
    const searchData = await searchRes.json();
    if (!searchData || searchData.length === 0) throw new Error("No results");

    const videoId = searchData[0].videoId;

    // Stream alırıq
    const streamRes = await fetch(`/api/youtube?type=stream&id=${videoId}`);
    if (!streamRes.ok) throw new Error("Stream Error");
    
    const videoData = await streamRes.json();
    
    // Invidious formatından audio tapırıq
    const adaptiveFormats = videoData.adaptiveFormats;
    if (adaptiveFormats) {
      const audio = adaptiveFormats
        .filter((s: any) => s.type.includes("audio"))
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
      if (audio) return audio.url;
    }

    throw new Error("Audio not found in API response");

  } catch (error) {
    console.warn("Plan A failed, switching to Plan B (Direct Browser Fetch)...");
    // --- PLAN B: BROWSER DIRECT FETCH ---
    return await searchDirectly(track);
  }
}
