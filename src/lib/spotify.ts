import { Track, Playlist } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

// Spotify-dan gələn Track formatını bizim Track formatına çevirir
const mapSpotifyTrackToAppTrack = (rawSpotifyTrack: any): Track | null => {
  // Playlist end-pointində item.track olur, digər hallarda isə birbaşa track obyektini ala bilərik
  const track = rawSpotifyTrack?.track ?? rawSpotifyTrack;

  // Episode və ya null gələn halları atırıq
  if (!track || track.type !== "track") return null;

  return {
    id: track.id || `spotify-${Math.random()}`, // ID yoxdursa uydururuq
    title: track.name || "Adsız Mahnı",
    artist: track.artists ? track.artists.map((a: any) => a.name).join(", ") : "Naməlum Sənətçi",
    album: track.album ? track.album.name : "",
    duration: track.duration_ms ? Math.floor(track.duration_ms / 1000) : 0,
    // Şəkil yoxdursa standart şəkil qoyuruq
    coverUrl:
      track.album?.images?.[0]?.url ||
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    // preview_url olsa belə, əsas playback üçün Spotify URI istifadə olunacaq
    audioUrl: track.preview_url || "",
    liked: false,
    source: "spotify",
    spotifyUri: track.uri || null,
  };
};

const fetchPlaylistTracks = async (playlistId: string, accessToken: string): Promise<Track[]> => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  let nextUrl = `${SPOTIFY_API}/playlists/${playlistId}/tracks?limit=100&market=from_token`;
  const tracks: Track[] = [];

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("Spotify playlist tracks error:", response.status, errorBody);
      throw new Error(`Playlist tracks fetch failed with status ${response.status}`);
    }

    const data = await response.json();
    const mappedTracks = (data.items ?? [])
      .map((item: any) => mapSpotifyTrackToAppTrack(item))
      .filter((track): track is Track => track !== null);

    tracks.push(...mappedTracks);
    nextUrl = data.next;
  }

  return tracks;
};

// İstifadəçinin Spotify Playlisterini gətirir
export const fetchSpotifyPlaylists = async (accessToken: string): Promise<Playlist[]> => {
  try {
    // 1. Playlisterin siyahısını al (API URL düzəldildi)
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

    if (!items) return [];

    // 2. Hər playlistin içindəki mahnıları almaq üçün detallı sorğu
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
          // Mahnıları ala bilməsək də, boş playlisti qaytarırıq
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

    // Null olanları (xətalı playlistləri) təmizləyirik
    return fullPlaylists.filter(Boolean);

  } catch (error) {
    console.error("Spotify General Error:", error);
    return [];
  }
};
