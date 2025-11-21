import { Track } from "@/types";

// Sorğunu təmizləyən funksiya (Axtarışın dəqiq olması üçün bunu saxlamaq məsləhətdir)
function cleanQuery(artist: string, title: string): string {
  return `${artist} - ${title}`
    .replace(/feat\.|ft\.|official|video|audio|lyrics/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .trim();
}

// === YALNIZ ITUNES AXTARIŞI ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`
    );
    
    if (!res.ok) return null;

    const data = await res.json();
    // iTunes 30 saniyəlik preview qaytarır
    return data.results?.[0]?.previewUrl || null;
  } catch (e) {
    console.error("iTunes error:", e);
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
// Adı dəyişmədim ki, layihədə başqa yerlərdə import xətası verməsin
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const query = cleanQuery(track.artist, track.title);
  console.log(`🎵 iTunes Axtarış: "${query}"`);
  
  return await searchiTunes(query);
}
