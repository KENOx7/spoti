import { Track } from "@/types";

// CORS Proxy (Körpü) - Bu, CORS xətasını ləğv edir
const CORS_PROXY = "https://api.allorigins.win/raw?url=";

// Ən dözümlü serverlərin siyahısı
const SERVERS = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.moomoo.me",
  "https://pipedapi.drgns.space",
  "https://pipedapi.adminforge.de",
  "https://api.piped.privacydev.net",
  "https://piped-api.lunar.icu"
];

async function fetchWithProxy(url: string) {
  // URL-i proxy vasitəsilə çağırırıq
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniyə vaxt

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
  // Axtarış sorğusu
  const query = `${track.title} ${track.artist} official audio`;

  // Serverləri qarışdırırıq (Random)
  const shuffledServers = [...SERVERS].sort(() => Math.random() - 0.5);

  for (const base of shuffledServers) {
    try {
      console.log(`Trying server: ${base}`);

      // 1. Axtarış (Proxy ilə)
      const searchUrl = `${base}/search?q=${encodeURIComponent(query)}&filter=music_songs`;
      const searchData = await fetchWithProxy(searchUrl);

      if (!searchData.items || searchData.items.length === 0) continue;

      const videoId = searchData.items[0].url.split("/watch?v=")[1];

      // 2. Stream (Proxy ilə)
      const streamUrl = `${base}/streams/${videoId}`;
      const streamData = await fetchWithProxy(streamUrl);

      const audioStreams = streamData.audioStreams;
      if (!audioStreams || audioStreams.length === 0) continue;

      // .m4a formatını tapırıq (iPhone və Web üçün ən yaxşısı)
      const m4a = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
      
      // Əgər m4a yoxdursa, ən yüksək keyfiyyətli hər hansı birini götür
      const bestAudio = m4a || audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

      if (bestAudio) {
        console.log("Audio found!", bestAudio.url);
        return bestAudio.url;
      }

    } catch (error) {
      console.warn(`Server ${base} failed, trying next...`);
      continue;
    }
  }

  console.error("Heç bir serverdən nəticə alınmadı.");
  return null;
}
