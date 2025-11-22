import { Track } from "@/types";

// Sorğunu təmizləyən funksiya
function cleanQuery(text: string): string {
  return text
    .replace(/feat\.|ft\.|official|video|audio|lyrics|remastered|remaster|mix/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// === YALNIZ ITUNES AXTARIŞI ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    // Axtarış URL-i (limit=1)
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    
    if (data.resultCount === 0 || !data.results?.[0]?.previewUrl) {
      console.warn(`⚠️ iTunes-da tapılmadı: "${query}"`);
      return null;
    }

    // iTunes 30 saniyəlik preview linkini qaytarır (.m4a)
    console.log(`✅ iTunes Tapdı: "${query}" -> ${data.results[0].trackName}`);
    return data.results[0].previewUrl;
  } catch (e) {
    console.error("iTunes xətası:", e);
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // 1. Cəhd: Tam dəqiqliklə axtar (Artist + Mahnı)
  const artist = cleanQuery(track.artist);
  const title = cleanQuery(track.title);
  const fullQuery = `${artist} ${title}`;
  
  let url = await searchiTunes(fullQuery);

  // 2. Cəhd (Fallback): Əgər tapılmadısa, yalnız mahnı adı ilə axtar
  if (!url) {
    console.log(`🔄 Təkrar axtarış (Yalnız ad): "${title}"`);
    url = await searchiTunes(title);
  }

  return url;
}
