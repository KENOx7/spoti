import { Track } from "@/types";

// Piped API (YouTube üçün pulsuz, açıq mənbəli API)
const PIPED_API_URL = "https://pipedapi.kavin.rocks"; 

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  try {
    // 1. Axtarış sorğusu düzəldirik (Mahnı adı + Sənətçi)
    const query = `${track.title} ${track.artist} official audio`;
    
    // 2. YouTube-da axtarış edirik
    const searchRes = await fetch(`${PIPED_API_URL}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn("YouTube-da mahnı tapılmadı:", track.title);
      return null;
    }

    // İlk nəticəni götürürük (Video ID)
    const videoId = searchData.items[0].url.split("/watch?v=")[1];

    // 3. Videonun səs axınlarını (streams) alırıq
    const streamRes = await fetch(`${PIPED_API_URL}/streams/${videoId}`);
    const streamData = await streamRes.json();

    // 4. Ən yaxşı səs formatını tapırıq (.m4a formatı iPhone-da daha yaxşı işləyir)
    const audioStreams = streamData.audioStreams;
    
    // .m4a formatını axtarırıq (Apple cihazları üçün vacibdir)
    const m4aStream = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
    
    // Əgər m4a yoxdursa, hər hansı birini götürürük
    const bestStream = m4aStream || audioStreams[0];

    return bestStream ? bestStream.url : null;

  } catch (error) {
    console.error("YouTube Fetch Error:", error);
    return null;
  }
}