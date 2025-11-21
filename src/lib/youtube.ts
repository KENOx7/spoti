import { Track } from "@/types";

// === 1. YENİ COBALT SERVERLƏRİ (GET Sorğusu üçün) ===
const COBALT_INSTANCES = [
  "https://cobalt.tools",
  "https://api.cobalt.7io.org",
  "https://cobalt.kwiatekmiki.pl",
  "https://cobalt.timos.design",
  "https://co.wuk.sh",
  "https://api.cobalt.biz"
];

// === 2. KÖMƏKÇİ: PROXY İLƏ FETCH ===
// GET sorğusu olduğu üçün proxy daha rahat işləyəcək
async function fetchWithProxy(url: string) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// === 3. VİDEO ID TAPMAQ (DuckDuckGo - Dəyişməz olaraq qalır) ===
async function findVideoId(artist: string, title: string): Promise<string | null> {
  const query = `${artist} - ${title} official audio site:youtube.com`;
  console.log(`🕵️ Axtarış: ${query}`);

  const ddgUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://duckduckgo.com/html/?q=${query}`)}`;
  
  try {
    const res = await fetch(ddgUrl);
    const html = await res.text();
    const regex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
    const match = regex.exec(html);
    if (match && match[1]) return match[1];
  } catch (e) {}
  
  return null;
}

// === 4. COBALT STREAM (GET Metodu ilə) ===
async function getCobaltStream(videoId: string): Promise<string | null> {
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

  for (const instance of COBALT_INSTANCES) {
    try {
      // POST əvəzinə GET istifadə edirik (Proxy dostu)
      // Cobalt API (v7) GET dəstəkləyir
      const apiUrl = `${instance}/api/json?url=${encodeURIComponent(targetUrl)}&isAudioOnly=true&aFormat=mp3`;
      
      // Birbaşa yoxlayaq
      let res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
      
      // Əgər CORS xətası versə, proxy ilə yoxlayaq
      if (!res.ok) {
         const data = await fetchWithProxy(apiUrl);
         if (data && data.url) {
            console.log(`✅ Cobalt Stream (Proxy): ${instance}`);
            return data.url;
         }
         continue;
      }

      const data = await res.json();
      if (data.url) {
        console.log(`✅ Cobalt Stream (Direct): ${instance}`);
        return data.url;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 5. YENİ FALLBACK: YTMP3 (Sadə API) ===
async function getYtMp3Stream(videoId: string): Promise<string | null> {
  try {
    // RapidAPI və ya oxşar açıq API-lər
    // Bu sadə bir nümunədir, işləməyə bilər, amma sınamağa dəyər
    const apiUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
    // Vevioz birbaşa HTML qaytarır, içindən linki çıxarmaq lazımdır
    // Amma ən sadəsi iTunes fallback-dir.
    return null;
  } catch (e) {
    return null;
  }
}

// === 6. ITUNES (Son Çarə) ===
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
  const cleanTitle = track.title.replace(/\(.*\)/g, "").trim();

  // 1. Video ID
  const videoId = await findVideoId(cleanArtist, cleanTitle);

  if (videoId) {
    console.log(`🎯 Video ID: ${videoId}`);
    
    // 2. Cobalt (GET)
    const cobaltUrl = await getCobaltStream(videoId);
    if (cobaltUrl) return cobaltUrl;
  }

  // 3. Fallback
  console.warn("⚠️ iTunes Fallback");
  return await searchiTunes(`${cleanArtist} - ${cleanTitle}`);
}
