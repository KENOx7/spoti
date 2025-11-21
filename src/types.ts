// src/types.ts
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; 
  coverUrl: string;
  audioUrl: string; 
  videoUrl?: string; // Bu vacibdir
  liked?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt?: Date;
}
