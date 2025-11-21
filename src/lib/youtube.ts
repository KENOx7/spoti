import { Track } from "@/types";

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  try {
    // 1. Mahnını axtarırıq (Öz Backend-imizə sorğu atırıq)
    const query = `${track.title} ${track.artist} official audio`;
    
    // Diqqət: URL artıq Piped yox, /api/youtube olacaq
    const searchRes = await fetch(`/api/youtube?type=search&q=${encodeURIComponent(query)}`);
    
    if (!searchRes.ok) throw new Error("Search API error");
    
    const searchData = await searchRes.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn("YouTube-da mahnı tapılmadı:", track.title);
      return null;
    }

    // İlk nəticəni götürürük (Video ID)
    const videoId = searchData.items[0].url.split("/watch?v=")[1];

    // 2. Səs linkini alırıq (Yenə öz Backend-imizdən)
    const streamRes = await fetch(`/api/youtube?type=stream&id=${videoId}`);
    
    if (!streamRes.ok) throw new Error("Stream API error");
    
    const streamData = await streamRes.json();

    // 3. Ən yaxşı səs formatını tapırıq
    const audioStreams = streamData.audioStreams;
    
    if (!audioStreams || audioStreams.length === 0) return null;

    // .m4a formatı (Apple və əksər cihazlar üçün ən yaxşısı)
    const m4aStream = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
    
    // Əgər m4a yoxdursa, keyfiyyəti ən yüksək olanı götür
    const bestStream = m4aStream || audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

    return bestStream ? bestStream.url : null;

  } catch (error) {
    console.error("YouTube Proxy Error:", error);
    return null;
  }
}
