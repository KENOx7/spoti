/// <reference types="vite/client" />
/// <reference path="./types/spotify-web-playback-sdk.d.ts" />

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

export {};
