import { Track } from "@/types";

const ITUNES_API = "https://itunes.apple.com/search";

// iTunes-dan gələn datanı Sizin Track formatına çevirir
const mapItunesTrackToAppTrack = (itunesTrack: any): Track => {
  return {
    id: String(itunesTrack.trackId),
    title: itunesTrack.trackName,
    artist: itunesTrack.artistName,
    album: itunesTrack.collectionName || "Unknown Album",
    duration: Math.floor(itunesTrack.trackTimeMillis / 1000), // millisaniyəni saniyəyə çeviririk
    // Şəkli daha keyfiyyətli etmək üçün 100x100-ü 600x600 ilə əvəz edirik
    coverUrl: itunesTrack.artworkUrl100?.replace("100x100", "600x600") || "",
    audioUrl: itunesTrack.previewUrl || "", // iTunes-un 30 saniyəlik play linki
  };
};

// Mahnı adı və ya sənətçi axtarmaq üçün funksiya
export async function searchItunesTracks(query: string): Promise<Track[]> {
  if (!query) return [];

  try {
    // iTunes API sorğusu (limit=50)
    const url = `${ITUNES_API}?term=${encodeURIComponent(query)}&media=music&entity=song&limit=50`;
    
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`iTunes API Error: ${res.statusText}`);
    }

    const data = await res.json();
    
    // Nəticələri map edirik
    return data.results.map(mapItunesTrackToAppTrack);
  } catch (error) {
    console.error("iTunes Search Error:", error);
    return [];
  }
}
