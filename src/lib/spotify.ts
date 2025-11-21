import { Track, Playlist } from "@/types";

const mapSpotifyTrackToAppTrack = (spotifyTrack: any): Track => {
  const track = spotifyTrack.track;
  if (!track) return null as any;

  return {
    id: track.id || `spotify-${Math.random()}`,
    title: track.name || "Adsız Mahnı",
    artist: track.artists ? track.artists.map((a: any) => a.name).join(", ") : "Naməlum Sənətçi",
    album: track.album ? track.album.name : "",
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    coverUrl: track.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    audioUrl: track.preview_url || "", 
    liked: false
  };
};

// KÖMƏKÇİ FUNKSİYA: Bütün səhifələri (pagination) gəzir
async function fetchAllTracksFromPlaylist(url: string, accessToken: string): Promise<Track[]> {
  let allTracks: Track[] = [];
  let nextUrl = url;

  // Nə qədər ki "next" linki var, davam et
  while (nextUrl) {
    try {
      const response = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) break;

      const data = await response.json();
      
      const pageTracks = data.items
        .map(mapSpotifyTrackToAppTrack)
        .filter((t: Track) => t !== null);

      allTracks = [...allTracks, ...pageTracks];
      nextUrl = data.next; // Sonrakı səhifənin linki

    } catch (err) {
      console.error("Error fetching page:", err);
      break;
    }
  }

  return allTracks;
}

export const fetchSpotifyPlaylists = async (accessToken: string): Promise<Playlist[]> => {
  try {
    // 1. Playlisterin siyahısını al
    const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) throw new Error("Spotify playlists fetch failed");

    const data = await response.json();
    const items = data.items;

    if (!items || items.length === 0) return [];

    // 2. Hər playlistin BÜTÜN mahnılarını al
    const fullPlaylists: Playlist[] = await Promise.all(
      items.map(async (item: any) => {
        if (!item) return null;

        const tracks = await fetchAllTracksFromPlaylist(item.tracks.href, accessToken);

        return {
          id: item.id,
          name: item.name,
          description: item.description || "Spotify Playlist",
          coverUrl: item.images?.[0]?.url || "",
          tracks: tracks,
          createdAt: new Date(),
        };
      })
    );

    return fullPlaylists.filter((p): p is Playlist => p !== null);

  } catch (error) {
    console.error("Spotify General Error:", error);
    return [];
  }
};