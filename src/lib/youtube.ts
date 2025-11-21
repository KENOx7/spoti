import { Track } from "@/types";

type ApiType = "piped" | "invidious";

interface ApiInstance {
  type: ApiType;
  url: string;
}

// Çoxlu sayda server qarışığı (Biri işləməsə, mütləq digəri işləyəcək)
const API_INSTANCES: ApiInstance[] = [
  // --- Piped Serverləri ---
  { type: "piped", url: "https://pipedapi.kavin.rocks" },
  { type: "piped", url: "https://api.piped.ot.ax" },
  { type: "piped", url: "https://api.piped.projectsegfau.lt" },
  { type: "piped", url: "https://pipedapi.system41.science" },
  { type: "piped", url: "https://pipedapi.moomoo.me" },
  
  // --- Invidious Serverləri (Bunlar daha dözümlüdür) ---
  { type: "invidious", url: "https://inv.tux.pizza" },
  { type: "invidious", url: "https://invidious.projectsegfau.lt" },
  { type: "invidious", url: "https://vid.puffyan.us" },
  { type: "invidious", url: "https://invidious.fdn.fr" },
  { type: "invidious", url: "https://invidious.perennialte.ch" },
  { type: "invidious", url: "https://invidious.drgns.space" },
  { type: "invidious", url: "https://yt.artemislena.eu" }
];

// Timeout funksiyası (3 saniyə gözləyir, cavab yoxdursa atır)
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// --- PIPED MƏNTİQİ ---
async function tryPiped(baseUrl: string, query: string): Promise<string | null> {
  // 1. Axtarış
  const searchRes = await fetchWithTimeout(`${baseUrl}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
  if (!searchRes.ok) throw new Error("Piped search failed");
  const searchData = await searchRes.json();
  
  if (!searchData.items || searchData.items.length === 0) return null;
  const videoId = searchData.items[0].url.split("/watch?v=")[1];

  // 2. Stream
  const streamRes = await fetchWithTimeout(`${baseUrl}/streams/${videoId}`);
  if (!streamRes.ok) throw new Error("Piped stream failed");
  const streamData = await streamRes.json();

  const audioStreams = streamData.audioStreams;
  if (!audioStreams || audioStreams.length === 0) return null;

  const m4aStream = audioStreams.find((s: any) => s.mimeType === "audio/mp4");
  return m4aStream ? m4aStream.url : audioStreams[0].url;
}

// --- INVIDIOUS MƏNTİQİ ---
async function tryInvidious(baseUrl: string, query: string): Promise<string | null> {
  // 1. Axtarış
  const searchRes = await fetchWithTimeout(`${baseUrl}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
  if (!searchRes.ok) throw new Error("Invidious search failed");
  const searchData = await searchRes.json();

  if (!searchData || searchData.length === 0) return null;
  const videoId = searchData[0].videoId;

  // 2. Stream (Videonu birbaşa çağırırıq)
  const videoRes = await fetchWithTimeout(`${baseUrl}/api/v1/videos/${videoId}`);
  if (!videoRes.ok) throw new Error("Invidious video failed");
  const videoData = await videoRes.json();

  // Adaptive formats (yalnız səs)
  const adaptiveFormats = videoData.adaptiveFormats;
  if (!adaptiveFormats || adaptiveFormats.length === 0) return null;

  // Audio axtarırıq
  const audioStream = adaptiveFormats
    .filter((s: any) => s.type.includes("audio"))
    .sort((a: any, b: any) => b.bitrate - a.bitrate)[0]; // Ən yüksək keyfiyyət

  return audioStream ? audioStream.url : null;
}

// --- ƏSAS FUNKSİYA ---
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const query = `${track.title} ${track.artist} official audio`;

  // Serverləri qarışdırırıq ki, yük tək birinə düşməsin
  const shuffledInstances = [...API_INSTANCES].sort(() => Math.random() - 0.5);

  for (const instance of shuffledInstances) {
    try {
      // console.log(`Trying ${instance.type}: ${instance.url}`); // Debug üçün
      let result = null;

      if (instance.type === "piped") {
        result = await tryPiped(instance.url, query);
      } else {
        result = await tryInvidious(instance.url, query);
      }

      if (result) {
        // Uğurlu oldu!
        return result;
      }
    } catch (error) {
      // Bu server işləmədi, növbətiyə keç
      continue;
    }
  }

  console.error("Bütün serverlər yoxlandı, mahnı tapılmadı.");
  return null;
}
