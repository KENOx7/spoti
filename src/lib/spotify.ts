import { Track, Playlist } from "@/types";

// Bu URL sizin proxy serveriniz kimi görünür. Olduğu kimi saxladım.
// Əgər işləmirsə, standart "https://api.spotify.com/v1/me/playlists" olmalıdır.
const SPOTIFY_API = "https://api.spotify.com/v1/me/playlists"; 

const mapSpotifyTrackToAppTrack = (rawSpotifyTrack: any): Track | null => {
  const track = rawSpotifyTrack?.track ?? rawSpotifyTrack;
  if (!track || track.type !== "track") return null;

  return {
    id: track.id || `spotify-${Math.random()}`,
    title: track.name || "Unknown Title",
    artist: track.artists ? track.artists.map((a: any) => a.name).join(", ") : "Unknown Artist",
    album: track.album ? track.album.name : "",
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    coverUrl: track.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    audioUrl: "" // iTunes-dan dolacaq
  };
};

async function fetchPlaylistTracks(playlistId: string, token: string): Promise<Track[]> {
  try {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.items
      .map(mapSpotifyTrackToAppTrack)
      .filter((t: Track | null): t is Track => t !== null);
  } catch (e) {
    console.error("Spotify Tracks Error:", e);
    return [];
  }
}

export async function fetchSpotifyPlaylists(accessToken: string): Promise<Playlist[]> {
  try {
    const response = await fetch(SPOTIFY_API, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify playlists");
    }

    const data = await response.json();
    const items = data.items || [];

    const fullPlaylists = await Promise.all(
      items.map(async (item: any) => {
        const tracks = await fetchPlaylistTracks(item.id, accessToken);
        return {
          id: item.id,
          name: item.name,
          description: item.description || "",
          coverUrl: item.images?.[0]?.url || "",
          tracks: tracks,
          createdAt: new Date(),
        };
      })
    );

    return fullPlaylists;
  } catch (error) {
    console.error("Spotify Import Error:", error);
    throw error;
  }
}