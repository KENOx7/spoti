import { Track } from "@/types";

// Ən yeni və stabil Piped API serverləri (2024-2025)
// Biri işləməsə, kod avtomatik digərinə keçəcək.
const PIPED_INSTANCES = [
  "https://api.piped.ot.ax",           // Çox stabil
  "https://api.piped.projectsegfau.lt",// Çox stabil
  "https://pipedapi.kavin.rocks",      // Orijinal (bəzən CORS verir)
  "https://pipedapi.moomoo.me",        // Alternativ
  "https://pipedapi.smnz.de",          // Alternativ
  "https://pipedapi.adminforge.de",    // Alternativ
  "https://api.piped.privacydev.net",  // Alternativ
  "https://pipedapi.ducks.party",      // Alternativ
  "https://piped-api.lunar.icu"        // Alternativ
];

// Köməkçi funksiya: Serverləri sıra ilə yoxlayır
async function fetchWithFallback(path: string): Promise<any> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const url = `${instance}${path}`;
      
      // Timeout əlavə edirik ki, ölü serveri çox gözləməsin (3 saniyə)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Əgər boş cavab gəlibsə, bunu xəta kimi qəbul et
        if (Array.isArray(data) && data.length === 0) continue; 
        return data;
      }
    } catch (error) {
      // Bu server işləmədi, səssizcə növbətiyə keçirik
      continue;
    }
  }
  throw new Error("Bütün serverlər yoxlandı, heç biri cavab vermədi.");
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
