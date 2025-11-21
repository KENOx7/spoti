// src/types.ts

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // saniyə ilə
  coverUrl: string;
  audioUrl: string; // Artıq əsasən istifadə olunmayacaq, amma saxlaya bilərik
  videoUrl?: string; // <-- YENİ: YouTube linki üçün
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