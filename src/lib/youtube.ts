import { Track } from "@/types";

// Musiqi axtarışı üçün API-lər (YouTube əvəzinə)
// Bu API-lər musiqi üçün xüsusi yaradılıb və daha stabildir.

async function searchSaavn(query: string): Promise<string | null> {
  try {
    // Saavn API (Musiqi üçün ən yaxşı pulsuz mənbə)
    const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // Nəticə varmı yoxla
    if (data.success && data.data.results.length > 0) {
      // Ən uyğun mahnını götür
      const song = data.data.results[0];
      
      // Ən yüksək keyfiyyətli yükləmə linkini tap (320kbps)
      // downloadUrl array olur, adətən sonuncu ən keyfiyyətlidir
      const downloadLink = song.downloadUrl.find((url: any) => url.quality === "320kbps") || 
                           song.downloadUrl[song.downloadUrl.length - 1];
                           
      if (downloadLink && downloadLink.url) {
        console.log("✅ Audio found on Saavn:", song.name);
        return downloadLink.url;
      }
    }
    return null;
  } catch (error) {
    console.warn("Saavn API failed:", error);
    return null;
  }
}

async function searchiTunes(query: string): Promise<string | null> {
  try {
    // iTunes API (Çox sürətlidir, amma bəzən yalnız 30 saniyəlik verir)
    // Amma heç nədən yaxşıdır və 100% işləyir.
    const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      console.log("✅ Audio found on iTunes");
      return data.results[0].previewUrl;
    }
    return null;
  } catch (error) {
    console.warn("iTunes API failed:", error);
    return null;
  }
}

// Əsas funksiya
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Axtarış sorğusu
  const query = `${track.title} ${track.artist}`;
  console.log(`🔍 Searching audio for: ${query}`);

  // 1. PLAN A: Saavn API (Ən yaxşı keyfiyyət)
  const saavnUrl = await searchSaavn(query);
  if (saavnUrl) return saavnUrl;

  // 2. PLAN B: iTunes API (Ən stabil ehtiyat variant)
  const itunesUrl = await searchiTunes(query);
  if (itunesUrl) return itunesUrl;

  console.error("❌ Mahnı heç bir mənbədə tapılmadı.");
  return null;
}
