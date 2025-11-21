import { Track } from "@/types";

// === AYARLAR ===
const TIMEOUT_MS = 5000;

// === GÜCLÜ SERVERLƏR (COBALT) ===
// YouTube kilidini qıran və MP3 linki verən serverlər
const COBALT_INSTANCES = [
  "https://cobalt.sipmaker.net",
  "https://api.cobalt.7io.org",
  "https://co.wuk.sh",
  "https://cobalt.tools",
  "https://cobalt.kwiatekmiki.pl",
  "https://cobalt.timos.design",
  "https://api.cobalt.biz"
];

// === YARDIMÇI FUNKSİYALAR ===

// Proxy ilə fetch (CORS xətasını ləğv edir)
async function aggressiveFetch(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // 1. Birbaşa yoxlayaq (Bəzi saytlar CORS bloklamır)
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return await res.text();
  } catch (e) {}

  // 2. AllOrigins Proxy (HTML skrapinq üçün idealdır)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    if (data.contents) return data.contents;
  } catch (e) {}

  // 3. CorsProxy (Son şans)
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
  // "site:youtube.com" əmri ilə dəqiq nəticə alırıq
  const query = `${artist} - ${title} official audio site:youtube.com`;
  console.log(`🕵️ Gizli Axtarış (DDG): ${query}`);

  // DuckDuckGo HTML versiyası (çox yüngüldür və bloklanmır)
  const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

  const html = await aggressiveFetch(ddgUrl);
  
  if (!html) return null;

  // Regex ilə YouTube ID-sini HTML-in içindən çəkib çıxarırıq
  // watch?v=XXXXXXXXXXX formatını axtarır (11 simvol)
  const regex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
  
  // İlk 3 nəticəni yoxlayırıq (bəzən birincisi reklam ola bilər)
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null && count < 3) {
    if (match[1]) {
        console.log(`🎯 ID Tapıldı: ${match[1]}`);
        return match[1];
    }
    count++;
  }

  return null;
}

// === ALTERNATIV ID AXTARIŞI (PIPED API - Fallback) ===
async function findVideoIdFallback(artist: string, title: string): Promise<string | null> {
  const pipedServers = [
      "https://api.piped.ot.ax", 
      "https://pipedapi.kavin.rocks",
      "https://api.piped.projectsegfau.lt"
  ];
  
  const q = `${artist} - ${title} audio`;

  for (const server of pipedServers) {
    try {
      const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${server}/api/v1/search?q=${encodeURIComponent(q)}&filter=music_songs`)}`;
      const res = await fetch(url);
      if(!res.ok) continue;
      
      const json = await res.json();
      
      if (Array.isArray(json) && json.length > 0) {
        // Short olmayan, 1 dəqiqədən uzun video seçirik
        const vid = json.find((v: any) => !v.isShort && v.duration > 60);
        if (vid) {
            const id = vid.url.split("v=")[1];
            if(id) return id;
        }
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
      // Cobalt JSON API
      const res = await fetch(`${instance}/api/json`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: targetUrl,
          isAudioOnly: true,
          aFormat: "mp3" // Və ya "best"
        })
      });

      const data = await res.json();
      
      if (data.url) {
        console.log(`✅ Stream Yaradıldı (${instance})`);
        return data.url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 3. ITUNES FALLBACK (Son Çarə) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`);
    const data = await res.json();
    if(data.results?.[0]?.previewUrl) {
        console.log("⚠️ iTunes Preview istifadə olunur");
        return data.results[0].previewUrl;
    }
    return null;
  } catch (e) { return null; }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Adları təmizləyirik
  const cleanArtist = track.artist.replace(/feat\.|ft\./gi, "").trim();
  const cleanTitle = track.title
    .replace(/\(.*\)/g, "") // (Official Video) sil
    .replace(/\[.*\]/g, "") // [4K] sil
    .trim();

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
