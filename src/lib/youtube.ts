import { Track } from "@/types";

// Sorğunu təmizləyən funksiya
function cleanQuery(artist: string, title: string): string {
  return `${artist} - ${title}`
    .replace(/feat\.|ft\.|official|video|audio|lyrics|remastered|remaster|mix/gi, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, " ") // Artıq boşluqları silir
    .trim();
}

// === ITUNES AXTARIŞI ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    // entity=song, media=music və limit=1
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    
    if (data.resultCount === 0 || !data.results?.[0]?.previewUrl) {
      console.warn(`⚠️ iTunes-da tapılmadı: "${query}"`);
      return null;
    }

    // iTunes 30 saniyəlik preview qaytarır
    console.log(`✅ iTunes Tapdı: "${query}" -> Preview URL`);
    return data.results[0].previewUrl;
  } catch (e) {
    console.error("iTunes error:", e);
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
// Bu funksiya Player.tsx tərəfindən çağırılır
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // 1. Tam Axtarış (Artist - Mahnı)
  const query = cleanQuery(track.artist, track.title);
  let url = await searchiTunes(query);

  // 2. Fallback: Əgər tapılmadısa, sadəcə mahnı adı ilə axtar
  if (!url) {
    console.log(`🔄 Təkrar axtarış (Yalnız ad): "${track.title}"`);
    url = await searchiTunes(track.title);
  }

  return url;
}
