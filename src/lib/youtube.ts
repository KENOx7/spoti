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

async function searchiTunes(query: string): Promise<string | null> {
  try {
    // Daha geniş axtarış üçün limit=1
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    return data.results?.[0]?.previewUrl || null;
  } catch (e) {
    console.error("iTunes axtarış xətası:", e);
    return null;
  }
}

export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // 1. Tam axtarış (Artist + Mahnı)
  const artist = cleanQuery(track.artist);
  const title = cleanQuery(track.title);
  const query1 = `${artist} ${title}`;
  
  let url = await searchiTunes(query1);

  // 2. Fallback: Əgər tapılmadısa, yalnız mahnı adı
  if (!url) {
    console.log(`🔄 2-ci cəhd (Ad): "${title}"`);
    url = await searchiTunes(title);
  }

  return url;
}
