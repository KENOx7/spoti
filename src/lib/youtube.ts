import { Track } from "@/types";

// İşlək Piped API serverlərinin siyahısı (Biri işləməsə, o birinə keçəcək)
const PIPED_INSTANCES = [
  "https://api.piped.ot.ax",          // Ən stabil
  "https://pipedapi.kavin.rocks",     // Orijinal (tez-tez xəta verir)
  "https://pa.il.ax",                 // Alternativ
  "https://piped-api.privacy.com.de", // Alternativ 2
  "https://api.piped.privacy.com.de", // Alternativ 3
  "https://pipedapi.drgns.space"      // Alternativ 4
];

// Köməkçi funksiya: Serverləri sıra ilə yoxlayır
async function fetchWithFallback(path: string): Promise<any> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const url = `${instance}${path}`;
      const response = await fetch(url);
      
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn(`Server xətası (${instance}):`, error);
      // Bu server işləmədi, növbətiyə keçirik...
      continue;
    }
  }
  throw new Error("Heç bir server cavab vermədi :(");
}

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  try {
    // 1. Axtarış sorğusu (Mahnı adı + Artist)
    const query = `${track.title} ${track.artist} official audio`;
    
    // 2. Axtarışı "Fallback" funksiyası ilə edirik
    const searchData = await fetchWithFallback(`/search?q=${encodeURIComponent(query)}&filter=music_songs`);

    if (!searchData.items || searchData.items.length === 0) {
      console.warn("YouTube-da mahnı tapılmadı:", track.title);
      return null;
    }

    // İlk nəticəni götürürük (Video ID)
    const videoId = searchData.items[0].url.split("/watch?v=")[1];

    // 3. Videonun səs axınlarını (streams) alırıq
    const streamData = await fetchWithFallback(`/streams/${videoId}`);

    // 4. Ən yaxşı səs formatını tapırıq
    const audioStreams = streamData.audioStreams;
    
    if (!audioStreams || audioStreams.length === 0) return null;

    // .m4a formatı (Apple və əksər cihazlar üçün ən yaxşısı)
    const m4aStream = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
    
    // Əgər m4a yoxdursa, keyfiyyəti ən yüksək olanı götür
    const bestStream = m4aStream || audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

    return bestStream ? bestStream.url : null;

  } catch (error) {
    console.error("YouTube Fetch Error:", error);
    return null;
  }
}
