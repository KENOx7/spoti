import { Track, Playlist } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

// Spotify-dan gələn Track formatını bizim Track formatına çevirir
const mapSpotifyTrackToAppTrack = (rawSpotifyTrack: any): Track | null => {
  const track = rawSpotifyTrack?.track ?? rawSpotifyTrack;

  if (!track || track.type !== "track") return null;

  return {
    id: track.id || `spotify-${Math.random()}`,
    title: track.name || "Adsız Mahnı",
    artist: track.artists ? track.artists.map((a: any) => a.name).join(", ") : "Naməlum Sənətçi",
    album: track.album ? track.album.name : "",
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    coverUrl:
      track.album?.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    audioUrl: "", // iTunes-dan dolacaq
  };
};

// 100 LIMITINI HƏLL EDƏN FUNKSIYA (Pagination)
async function fetchPlaylistTracks(playlistId: string, token: string): Promise<Track[]> {
  let allTracks: Track[] = [];
  // İlk sorğu: limit=100
  let url: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  try {
    while (url) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Spotify Tracks Fetch Error:", res.statusText);
        break;
      }

      const data = await res.json();
      
      const pageTracks = data.items
        .map(mapSpotifyTrackToAppTrack)
        .filter((t: Track | null): t is Track => t !== null);

      allTracks = [...allTracks, ...pageTracks];

      // Əgər növbəti səhifə varsa, URL-i yeniləyirik, yoxdursa dövr bitir
      url = data.next;
    }
  } catch (e) {
    console.error("Spotify Pagination Error:", e);
  }

  return allTracks;
}

export async function fetchSpotifyPlaylists(accessToken: string): Promise<Playlist[]> {
  try {
    // İstifadəçinin bütün playlistlərini çəkmək üçün (burada da pagination ola bilər, hələlik 50 qoyuruq)
    const response = await fetch(`${SPOTIFY_API}/me/playlists?limit=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify API Error:", errorData);
      throw new Error("Spotify playlists fetch failed");
    }

    const data = await response.json();
    const items = data.items;

    if (!items) return [];

    // Hər playlistin içindəki bütün mahnıları (100+) çəkmək
    const fullPlaylists: Playlist[] = await Promise.all(
      items.map(async (item: any) => {
        if (!item) return null;

        try {
          const playlistTracks = await fetchPlaylistTracks(item.id, accessToken);
          return {
            id: item.id,
            name: item.name,
            description: item.description || "Spotify Playlist",
            coverUrl: item.images?.[0]?.url || "",
            tracks: playlistTracks,
            createdAt: new Date(),
          };
        } catch (err) {
          console.error(`Error fetching tracks for playlist ${item.name}:`, err);
          return {
            id: item.id,
            name: item.name,
            description: item.description || "Spotify Playlist",
            coverUrl: item.images?.[0]?.url || "",
            tracks: [],
            createdAt: new Date(),
          };
        }
      })
    );

    return fullPlaylists.filter((p): p is Playlist => p !== null);
  } catch (error) {
    console.error("Spotify Import Error:", error);
    throw error;
  }
}
