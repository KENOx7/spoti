import { Track } from "@/types";

// === KONFİQURASİYA ===
const DEFAULT_TIMEOUT = 7000; 

// === PROXY SİSTEMİ (Biri işləməsə, o biri işə düşəcək) ===
// Bu ən vacib hissədir. Brauzer blokunu aşmaq üçün.
const PROXY_LIST = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

// === COBALT INSTANCES (YouTube kilidini qıran serverlər) ===
const COBALT_INSTANCES = [
  "https://cobalt.sipmaker.net", // Tez-tez işləyir
  "https://cobalt.tools",        // Rəsmi
  "https://co.wuk.sh",
  "https://api.cobalt.7io.org",
  "https://cobalt.kwiatekmiki.pl"
];

// === PIPED SERVERS (Sadəcə ID tapmaq üçün) ===
const PIPED_SERVERS = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.ot.ax",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.adminforge.de"
];

// === KÖMƏKÇİLER ===
function timeoutSignal(ms: number) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// Proxy Rotasiyası ilə Fetch
// Bu funksiya bir proxy işləməyəndə avtomatik o birinə keçir
async function fetchWithProxyRotation(url: string, options: any = {}) {
  for (const proxyGen of PROXY_LIST) {
    try {
      const proxyUrl = proxyGen(url);
      // console.log(`Trying proxy: ${proxyUrl}`);
      const res = await fetch(proxyUrl, { 
        ...options, 
        signal: timeoutSignal(5000) 
      });
      if (res.ok) return res;
    } catch (e) {
      continue;
    }
  }
  throw new Error("Bütün proxylər selbəst buraxıldı.");
}

function cleanQuery(artist: string, title: string): string {
  return `${artist} - ${title}`
    .replace(/feat\.|ft\.|official|video|audio|lyrics/gi, "")
    .trim();
}

// === 1. ID AXTARIŞI (Piped vasitəsilə) ===
async function findVideoId(query: string): Promise<string | null> {
  const searchQuery = `${query} audio`;
  
  for (const base of PIPED_SERVERS) {
    try {
      const targetUrl = `${base}/api/v1/search?q=${encodeURIComponent(searchQuery)}&filter=all`;
      
      // Axtarış üçün proxy rotasiyasını işlədirik
      const res = await fetchWithProxyRotation(targetUrl);
      const data = await res.json();

      if (!Array.isArray(data)) continue;

      // 1-15 dəqiqəlik videoları seçirik (mahnı üçün)
      const video = data.find((v: any) => 
        !v.isShort && 
        v.duration > 60 && 
        v.duration < 900
      );

      if (video) {
        const id = video.url.split("v=")[1];
        console.log(`🎯 Video Tapıldı: ${id} (${base})`);
        return id;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 2. COBALT İLƏ LİNK GENERASİYASI (MAGİC) ===
async function getCobaltStream(videoId: string): Promise<string | null> {
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

  for (const instance of COBALT_INSTANCES) {
    try {
      console.log(`⛏️ Cobalt işə düşdü: ${instance}`);
      
      // Cobalt POST request tələb edir
      const res = await fetch(`${instance}/api/json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          url: youtubeUrl,
          isAudioOnly: true, // Yalnız səs
          aFormat: "mp3"     // MP3 formatında
        }),
        signal: timeoutSignal(8000)
      });

      const data = await res.json();

      if (data.url) {
        console.log(`✅ TAM MAHNı LİNKİ: ${data.url}`);
        return data.url;
      }
    } catch (e) {
      // console.log(`Cobalt fail: ${instance}`);
      continue;
    }
  }
  return null;
}

// === 3. ITUNES (Ehtiyat) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results[0]?.previewUrl || null;
  } catch (e) {
    return null;
  }
}

// === ƏSAS SYSTEM ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const baseQuery = cleanQuery(track.artist, track.title);
  console.log(`🚀 Başlayır: ${baseQuery}`);

  // 1. Video ID tap
  const videoId = await findVideoId(baseQuery);

  if (videoId) {
    // 2. Cobalt ilə təmiz link al
    const fullUrl = await getCobaltStream(videoId);
    if (fullUrl) return fullUrl;
  }

  // 3. Heç biri işləməzsə iTunes
  console.warn("⚠️ Tam versiya tapılmadı, iTunes yoxlanılır...");
  return await searchiTunes(baseQuery);
}
