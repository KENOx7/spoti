export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
  liked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl: string;
  tracks: Track[];
  createdAt: Date;
}
