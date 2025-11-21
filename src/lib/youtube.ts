// src/lib/youtube.ts
import { Track } from "@/types";

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.tokhmi.xyz",
  "https://api.piped.mint.lgbt",
  "https://pipedapi.syncpwn.dev",
];

async function safeFetch(url: string): Promise<Response> {
  try {
    const res = await fetch(url);
    if (res.ok) return res;
  } catch (e) {
    // xəta olsa davam et
  }
  throw new Error("Fetch failed");
}

// Player Context bu funksiyanı istifadə edir
export async function getYoutubeId(track: Track): Promise<string | null> {
  const queries = [
    `${track.artist} - ${track.title} official video`,
    `${track.artist} - ${track.title} audio`,
  ];

  for (const instance of PIPED_INSTANCES) {
    for (const query of queries) {
      try {
        const searchUrl = `${instance}/search?q=${encodeURIComponent(query)}&filter=videos`;
        const searchRes = await safeFetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.items && searchData.items.length > 0) {
          const videoId = searchData.items[0].url.replace("/watch?v=", "");
          return videoId;
        }
      } catch (e) {
        continue;
      }
    }
  }
  return null;
}