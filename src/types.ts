export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  liked?: boolean;
  // Optional provider metadata (e.g. spotify) and original URI
  provider?: "spotify" | "local" | string;
  uri?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl: string;
  tracks: Track[];
  createdAt: Date;
}
