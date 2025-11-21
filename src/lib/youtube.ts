import { Track } from "@/types";

// CORS Proxy (Bütün sorğuları burdan keçirəcəyik)
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// Ən stabil serverlər (Yoxlanılıb)
const SERVERS = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.ot.ax",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.moomoo.me"
];

async function fetchWithProxy(url: string) {
  // URL encode edirik
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 saniyə vaxt veririk

  try {
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Proxy error");
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Axtarış sorğusu: Mahnı adı + Artist
  // "official audio" sözünü sildim, bəzən nəticəni azaldır
  const query = `${track.title} ${track.artist}`;

  // Serverləri qarışdırırıq
  const shuffledServers = [...SERVERS].sort(() => Math.random() - 0.5);

  for (const base of shuffledServers) {
    try {
      // 1. Axtarış
      const searchUrl = `${base}/search?q=${encodeURIComponent(query)}&filter=music_songs`;
      const searchData = await fetchWithProxy(searchUrl);

      if (!searchData.items || searchData.items.length === 0) continue;

      // İlk video ID-ni götürürük
      const videoId = searchData.items[0].url.split("/watch?v=")[1];

      // 2. Səs axını (Stream)
      const streamUrl = `${base}/streams/${videoId}`;
      const streamData = await fetchWithProxy(streamUrl);

      const audioStreams = streamData.audioStreams;
      if (!audioStreams || audioStreams.length === 0) continue;

      // .m4a axtarırıq
      const m4a = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
      
      // Tapılmasa, ən yüksək keyfiyyətlini götürürük
      const bestAudio = m4a || audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

      if (bestAudio) {
        return bestAudio.url;
      }

    } catch (error) {
      // Səssizcə növbəti serverə keçirik
      continue;
    }
  }

  return null;
}
