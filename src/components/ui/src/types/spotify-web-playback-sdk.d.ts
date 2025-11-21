declare namespace Spotify {
  interface PlaybackRestrictions {
    disallow_resuming_reasons?: string[];
  }

  interface TrackMetadata {
    uri?: string;
  }

  interface TrackWindow {
    current_track?: TrackMetadata;
    previous_tracks: TrackMetadata[];
  }

  interface PlaybackState {
    context?: unknown;
    disallows?: PlaybackRestrictions;
    paused: boolean;
    position: number;
    duration: number;
    track_window: TrackWindow;
  }

  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  class Player {
    constructor(options: PlayerInit);
    connect(): Promise<boolean>;
    disconnect(): boolean;
    addListener(event: string, cb: (state: any) => void): boolean;
    removeListener(event: string): boolean;
    togglePlay(): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
  }
}

export {};

