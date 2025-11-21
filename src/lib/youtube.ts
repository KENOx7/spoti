import { Track } from "@/types";

// === AYARLAR ===
const TIMEOUT_MS = 8000;

// === GÜCLÜ SERVERLƏR (COBALT) ===
// YouTube kilidini qıran əsas serverlər
const COBALT_INSTANCES = [
  "https://cobalt.sipmaker.net",
  "https://api.cobalt.7io.org",
  "https://co.wuk.sh",
  "https://cobalt.tools",
  "https://cobalt.kwiatekmiki.pl",
  "https://cobalt.timos.design"
];

// === PROXY & TOOLS ===

// Sadə Timeout funksiyası
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

// Təhlükəsiz fetch (Proxy rotasiyası ilə)
async function aggressiveFetch(url: string): Promise<string | null> {
  // 1. Birbaşa yoxlayaq (Bəlkə blok yoxdur)
  try {
    const c = new AbortController();
    setTimeout(() => c.abort(), 4000);
    const res = await fetch(url, { signal: c.signal });
    if (res.ok) return await res.text();
  } catch (e) {}

  // 2. AllOrigins Proxy (HTML skrapinq üçün idealdır)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    if (data.contents) return data.contents;
  } catch (e) {}

  // 3. CorsProxy (API üçün)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) return await res.text();
  } catch (e) {}

  return null;
}

// === 1. ID TAPMAQ (GİZLİ METOD: DUCKDUCKGO) ===
// API istifadə etmirik, birbaşa axtarış nəticəsini oxuyuruq.
async function findVideoId(artist: string, title: string): Promise<string | null> {
  const query = `${artist} - ${title} lyrics site:youtube.com`;
  console.log(`🕵️ Gizli Axtarış (DDG): ${query}`);

  // DuckDuckGo HTML versiyası (çox yüngüldür və bloklanmır)
  const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const html = await aggressiveFetch(ddgUrl);
  
  if (!html) return null;

  // Regex ilə YouTube ID-sini HTML-in içindən çəkib çıxarırıq
  // watch?v=XXXXXXXXXXX formatını axtarır
  const regex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
  const match = regex.exec(html);

  if (match && match[1]) {
    console.log(`🎯 ID Tapıldı: ${match[1]}`);
    return match[1];
  }

  return null;
}

// === ALTERNATIV ID AXTARIŞI (PIPED API) ===
async function findVideoIdFallback(artist: string, title: string): Promise<string | null> {
  const pipedServers = ["https://api.piped.ot.ax", "https://pipedapi.kavin.rocks"];
  const q = `${artist} - ${title} audio`;

  for (const server of pipedServers) {
    try {
      const url = `${server}/api/v1/search?q=${encodeURIComponent(q)}&filter=all`;
      const text = await aggressiveFetch(url);
      if (!text) continue;
      
      const json = JSON.parse(text);
      if (Array.isArray(json) && json.length > 0) {
        const vid = json.find((v: any) => !v.isShort && v.duration > 60);
        if (vid) return vid.url.split("v=")[1];
      }
    } catch (e) { continue; }
  }
  return null;
}

// === 2. AUDIO LİNKİNİ ALMAQ (COBALT) ===
async function getCobaltStream(videoId: string): Promise<string | null> {
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

  for (const instance of COBALT_INSTANCES) {
    try {
      // Cobalt adətən POST istəyir
      const res = await fetch(`${instance}/api/json`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: targetUrl,
          isAudioOnly: true,
          aFormat: "mp3"
        })
      });

      const data = await res.json();
      
      if (data.url) {
        console.log(`✅ Stream Yaradıldı: ${instance}`);
        return data.url;
      }
    } catch (e) {
      // console.warn(`Cobalt fail: ${instance}`);
      continue;
    }
  }
  return null;
}

// === 3. ITUNES FALLBACK ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`);
    const data = await res.json();
    return data.results?.[0]?.previewUrl || null;
  } catch (e) { return null; }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  const cleanArtist = track.artist.replace(/feat\.|ft\./gi, "").trim();
  const cleanTitle = track.title.replace(/\(.*\)|\[.*\]/g, "").trim();

  // 1. Video ID tapmağa çalışırıq (DDG Scraping)
  let videoId = await findVideoId(cleanArtist, cleanTitle);

  // Əgər DDG tapmasa, Piped API yoxla
  if (!videoId) {
    console.log("⚠️ DDG tapmadı, Piped yoxlanılır...");
    videoId = await findVideoIdFallback(cleanArtist, cleanTitle);
  }

  // 2. Əgər ID varsa, Cobalt ilə MP3 linki al
  if (videoId) {
    const streamUrl = await getCobaltStream(videoId);
    if (streamUrl) return streamUrl;
  }

  // 3. Heç nə işləməsə iTunes (Qara gün üçün)
  console.error("❌ Tam versiya alınmadı, iTunes qaytarılır.");
  return await searchiTunes(`${cleanArtist} - ${cleanTitle}`);
}
