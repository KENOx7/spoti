export {};

declare global {
  interface Window {
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => {
        connect: () => Promise<boolean>;
        disconnect: () => void;
        addListener: (event: string, cb: (data?: any) => void) => void;
        removeListener: (event: string) => void;
        activateElement: () => Promise<void>;
        setVolume: (volume: number) => Promise<void>;
      };
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

