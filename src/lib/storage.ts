// Storage utilities for persistence
import { Track, Playlist } from "@/types";

const STORAGE_KEYS = {
  LIKED_TRACKS: "likedTracks",
  PLAYLISTS: "playlists",
  PLAYER_VOLUME: "playerVolume",
  PLAYER_QUEUE: "playerQueue",
  CURRENT_TRACK: "currentTrack",
} as const;

export const storage = {
  // Liked tracks
  getLikedTracks: (): Track[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIKED_TRACKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveLikedTracks: (tracks: Track[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_TRACKS, JSON.stringify(tracks));
    } catch (error) {
      console.error("Failed to save liked tracks:", error);
    }
  },

  // Playlists
  getPlaylists: (): Playlist[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  savePlaylists: (playlists: Playlist[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (error) {
      console.error("Failed to save playlists:", error);
    }
  },

  // Volume
  getVolume: (): number => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_VOLUME);
      return saved ? parseFloat(saved) : 0.7;
    } catch {
      return 0.7;
    }
  },

  saveVolume: (volume: number): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_VOLUME, volume.toString());
    } catch (error) {
      console.error("Failed to save volume:", error);
    }
  },

  // Queue (optional - for restoring queue on reload)
  getQueue: (): Track[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveQueue: (queue: Track[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYER_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error("Failed to save queue:", error);
    }
  },

  // Current track (optional - for restoring playback state)
  getCurrentTrack: (): Track | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_TRACK);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  saveCurrentTrack: (track: Track | null): void => {
    try {
      if (track) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_TRACK, JSON.stringify(track));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_TRACK);
      }
    } catch (error) {
      console.error("Failed to save current track:", error);
    }
  },
};

