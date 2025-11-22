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

// === ITUNES AXTARIŞI ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`❌ iTunes API Xətası (${query}):`, res.statusText);
      return null;
    }

    const data = await res.json();
    
    if (data.resultCount === 0 || !data.results?.[0]?.previewUrl) {
      return null;
    }

    console.log(`✅ iTunes Tapdı: "${query}" -> ${data.results[0].trackName}`);
    return data.results[0].previewUrl;
  } catch (e) {
    console.error("iTunes connection error:", e);
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // 1. Artist - Mahnı (Təmiz)
  const artistClean = cleanQuery(track.artist);
  const titleClean = cleanQuery(track.title);
  
  let url = await searchiTunes(`${artistClean} - ${titleClean}`);

  // 2. Mahnı adı (Təmiz) - Fallback
  if (!url) {
    console.log(`🔄 Yenidən yoxlanılır (Yalnız ad): "${titleClean}"`);
    url = await searchiTunes(titleClean);
  }

  // 3. Original (Raw) - Fallback
  if (!url) {
    const rawQuery = `${track.artist} ${track.title}`;
    console.log(`🔄 Son yoxlama: "${rawQuery}"`);
    url = await searchiTunes(rawQuery);
  }

  return url;
}