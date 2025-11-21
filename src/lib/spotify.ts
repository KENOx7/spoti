import { Track, Playlist } from "@/types";

const SPOTIFY_API = "https://api.spotify.com/v1";

// Yardımçı: unknown tipindən təhlükəsiz sahələri oxumaq üçün
const safeGet = <T>(val: unknown, fallback: T): T => {
  return (val as any) ?? fallback;
};

// Spotify-dan gələn Track formatını bizim Track formatına çevirir
const mapSpotifyTrackToAppTrack = (rawSpotifyTrack: unknown): Track | null => {
  const asObj = rawSpotifyTrack as Record<string, any> | undefined;
  const track = asObj?.track ?? asObj;

  if (!track || (track.type && track.type !== "track")) return null;

  const artists = Array.isArray(track.artists)
    ? track.artists.map((a: any) => (a && typeof a === "object" ? a.name ?? "" : "")).filter(Boolean).join(", ")
    : "Unknown Artist";

  return {
    id: track.id ?? `spotify-${Math.random().toString(36).slice(2, 9)}`,
    title: track.name ?? "Unknown Title",
    artist: artists,
    album: track.album?.name ?? "",
    duration: typeof track.duration_ms === "number" ? Math.floor(track.duration_ms / 1000) : 0,
    coverUrl:
      track.album?.images?.[0]?.url ??
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60",
    audioUrl: track.preview_url ?? "",
    liked: false,
    provider: "spotify",
    uri: track.uri ?? undefined,
  };
};

const fetchPlaylistTracks = async (playlistId: string, accessToken: string): Promise<Track[]> => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  let nextUrl: string | null = `${SPOTIFY_API}/playlists/${playlistId}/tracks?limit=100&market=from_token`;
  const tracks: Track[] = [];

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("Spotify playlist tracks error:", response.status, errorBody);
      throw new Error(`Playlist tracks fetch failed with status ${response.status}`);
    }

    const data = await response.json().catch(() => ({} as any));
    const items = safeGet<any[]>(data.items, []);
    const mappedTracks = items
      .map((item) => mapSpotifyTrackToAppTrack(item))
      .filter((t): t is Track => t !== null);

    tracks.push(...mappedTracks);
    nextUrl = data.next ?? null;
  }

  return tracks;
};

// İstifadəçinin Spotify Playlisterini gətirir
export const fetchSpotifyPlaylists = async (accessToken: string): Promise<Playlist[]> => {
  try {
    const response = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Spotify API Error:", errorData);
      throw new Error("Spotify playlists fetch failed");
    }

    const data = await response.json().catch(() => ({} as any));
    const items = safeGet<any[]>(data.items, []);

    if (!Array.isArray(items) || items.length === 0) return [];

    const fullPlaylists = await Promise.all(
      items.map(async (item) => {
        if (!item || !item.id) return null;

        try {
          const playlistTracks = await fetchPlaylistTracks(item.id, accessToken);
          return {
            id: item.id,
            name: item.name ?? "",
            description: item.description ?? "Spotify Playlist",
            coverUrl: item.images?.[0]?.url ?? "",
            tracks: playlistTracks,
            createdAt: new Date(),
          } as Playlist;
        } catch (err) {
          console.error(`Error fetching tracks for playlist ${item.name ?? item.id}:`, err instanceof Error ? err.message : err);
          return {
            id: item.id,
            name: item.name ?? "",
            description: item.description ?? "Spotify Playlist",
            coverUrl: item.images?.[0]?.url ?? "",
            tracks: [],
            createdAt: new Date(),
          } as Playlist;
        }
      })
    );

    return fullPlaylists.filter((p): p is Playlist => p !== null);

  } catch (error) {
    console.error("Spotify General Error:", error instanceof Error ? error.message : error);
    return [];
  }
};
