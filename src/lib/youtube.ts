import { Track } from "@/types";

// Sorğunu təmizləyən funksiya
function cleanQuery(text: string): string {
  return text
    .replace(/feat\.|ft\.|official|video|audio|lyrics|remastered|remaster|mix/gi, "")
    .replace(/\(.*?\)/g, "") // Mötərizələri silir (bəzən vacib ola bilər, amma iTunes üçün təmiz ad yaxşıdır)
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, " ")    // Artıq boşluqları silir
    .trim();
}

// === ITUNES AXTARIŞI (Ümumi funksiya) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    // entity=song və limit=1 istifadə edirik
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await fetch(url);
    
    if (!res.ok) {
      console.error(`❌ iTunes API Xətası (${query}):`, res.statusText);
      return null;
    }

    const data = await res.json();
    
    if (data.resultCount === 0 || !data.results?.[0]?.previewUrl) {
      console.warn(`⚠️ iTunes-da tapılmadı: "${query}"`);
      return null;
    }

    // iTunes 30 saniyəlik preview qaytarır (.m4a formatında)
    console.log(`✅ iTunes Tapdı: "${query}" -> ${data.results[0].trackName}`);
    return data.results[0].previewUrl;
  } catch (e) {
    console.error("iTunes şəbəkə xətası:", e);
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // 1. Cəhd: Tam dəqiqliklə axtar (Artist + Mahnı)
  const artistClean = cleanQuery(track.artist);
  const titleClean = cleanQuery(track.title);
  
  const fullQuery = `${artistClean} - ${titleClean}`;
  let url = await searchiTunes(fullQuery);

  // 2. Cəhd (Fallback): Əgər tapılmadısa, yalnız mahnı adı ilə axtar
  if (!url) {
    console.log(`🔄 Təkrar axtarış edilir (Yalnız ad): "${titleClean}"`);
    url = await searchiTunes(titleClean);
  }

  // 3. Cəhd (Fallback): Əgər yenə tapılmadısa, orijinal adla axtar (təmizləmədən)
  if (!url) {
    const rawQuery = `${track.artist} ${track.title}`;
    console.log(`🔄 Son şans axtarışı: "${rawQuery}"`);
    url = await searchiTunes(rawQuery);
  }

  if (!url) {
    console.error(`❌ HEÇ BİR NƏTİCƏ TAPILMADI: ${track.artist} - ${track.title}`);
  }

  return url;
}
