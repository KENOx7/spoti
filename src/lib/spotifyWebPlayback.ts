// Minimal loader for Spotify Web Playback SDK
// This file exposes a function that returns a Promise which resolves
// when the global `Spotify` object is available.

export function loadSpotifySDK(): Promise<typeof window & { Spotify?: any }> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("No window object"));

    if ((window as any).Spotify) return resolve(window as any);

    const existing = document.querySelector('script[data-spotify-sdk]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window as any));
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-spotify-sdk", "true");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onload = () => resolve(window as any);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

export type SpotifyPlayerInstance = any;
