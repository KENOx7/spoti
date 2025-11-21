import { Track, Playlist } from "@/types";

// Spotify-dan gələn Track formatını bizim Track formatına çevirir
const mapSpotifyTrackToAppTrack = (spotifyTrack: any): Track => {
  const track = spotifyTrack.track;
  return {
    id: track.id,
    title: track.name,
    artist: track.artists.map((a: any) => a.name).join(", "),
    album: track.album.name,
    duration: Math.floor(track.duration_ms / 1000),
    coverUrl: track.album.images[0]?.url || "",
    // QEYD: Spotify bəzən preview_url vermir (null olur).
    audioUrl: track.preview_url || "", 
    liked: false
  };
};

// İstifadəçinin Spotify Playlisterini gətirir
export const fetchSpotifyPlaylists = async (accessToken: string): Promise<Playlist[]> => {
  try {
    // 1. Playlisterin siyahısını al
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw new Error("Spotify playlists fetch failed");

    const data = await response.json();
    const items = data.items;

    // 2. Hər playlistin içindəki mahnıları almaq üçün detallı sorğu
    const fullPlaylists: Playlist[] = await Promise.all(
      items.map(async (item: any) => {
        // Mahnıları çək
        const tracksResponse = await fetch(item.tracks.href, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const tracksData = await tracksResponse.json();
        
        const mappedTracks = tracksData.items
          .filter((t: any) => t.track && t.track.preview_url) // Yalnız səsi olanları götür (istəsəniz bunu silə bilərsiniz)
          .map(mapSpotifyTrackToAppTrack);

        return {
          id: item.id,
          name: item.name,
          description: item.description || "Spotify Playlist",
          coverUrl: item.images[0]?.url || "",
          tracks: mappedTracks,
          createdAt: new Date(),
        };
      })
    );

    return fullPlaylists;
  } catch (error) {
    console.error("Spotify Error:", error);
    return [];
  }
};