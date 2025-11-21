import { Track, Playlist } from "@/types";

// Spotify-dan gələn Track formatını bizim Track formatına çevirir
const mapSpotifyTrackToAppTrack = (spotifyTrack: any): Track => {
  const track = spotifyTrack.track;
  
  // Bəzən track null ola bilər, yoxlayırıq
  if (!track) return null as any;

  return {
    id: track.id || `spotify-${Math.random()}`,
    title: track.name || "Adsız Mahnı",
    artist: track.artists ? track.artists.map((a: any) => a.name).join(", ") : "Naməlum Sənətçi",
    album: track.album ? track.album.name : "",
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    coverUrl: track.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    // VACİB: preview_url varsa onu qoyuruq, yoxdursa boş qalır (Player bunu idarə etməlidir)
    audioUrl: track.preview_url || "", 
    liked: false
  };
};

// İstifadəçinin Spotify Playlisterini gətirir
export const fetchSpotifyPlaylists = async (accessToken: string): Promise<Playlist[]> => {
  try {
    // 1. Playlisterin siyahısını al (Orijinal Spotify API)
    // limit=50 qoyuruq ki, daha çox playlist gəlsin
    const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Spotify API Error:", errorData);
      throw new Error("Spotify playlists fetch failed");
    }

    const data = await response.json();
    const items = data.items;

    if (!items || items.length === 0) return [];

    // 2. Hər playlistin içindəki mahnıları almaq üçün detallı sorğu
    const fullPlaylists: Playlist[] = await Promise.all(
      items.map(async (item: any) => {
        if (!item) return null;

        try {
          // Playlistin mahnılarını çəkirik (limit=100)
          const tracksResponse = await fetch(`${item.tracks.href}?limit=100`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          
          let mappedTracks: Track[] = [];

          if (tracksResponse.ok) {
            const tracksData = await tracksResponse.json();
            
            // Mahnıları map edirik (Null olanları atırıq)
            mappedTracks = tracksData.items
              .map(mapSpotifyTrackToAppTrack)
              .filter((t: Track) => t !== null); 
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description || "Spotify Playlist",
            coverUrl: item.images?.[0]?.url || "",
            tracks: mappedTracks,
            createdAt: new Date(),
          };
        } catch (err) {
          console.error(`Error fetching tracks for playlist ${item.name}:`, err);
          return null;
        }
      })
    );

    // Null olan playlistləri təmizləyirik
    return fullPlaylists.filter((p): p is Playlist => p !== null);

  } catch (error) {
    console.error("Spotify General Error:", error);
    return [];
  }
};