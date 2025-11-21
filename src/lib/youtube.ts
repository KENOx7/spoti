import { Track } from "@/types";

const TIMEOUT = 8000;

// === 1. AXTARIŞ SERVERLƏRİ (stabil və CORS icazəli, 2025 noyabr) ===
const SEARCH_INSTANCES = [
  "https://inv.tux.pizza",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
  "https://invidious.drgns.space",
  "https://yewtu.be",
  "https://invidious.tiekoetter.com",
  "https://invidious.snwtic.com",
  "https://invidious.fdn.fr",
  "https://invidious.projectsegfau.lt"
];

// === 2. COBALT INSTANCES (ən stabil və aktual olanlar) ===
const COBALT_INSTANCES = [
  "https://cobalt.tools",          // rəsmi
  "https://co.wuk.sh",
  "https://cobalt.sipmaker.net",
  "https://api.cobalt.biz",
  "https://kityune.imput.net",
  "https://blossom.imput.net",
  "https://nachos.imput.net",
  "https://sunny.imput.net"
];

// Timeout helper
const fetchWithTimeout = async (url: string, options: any = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

// Daha ağıllı təmizləmə
function cleanQuery(artist: string, title: string): string {
  let q = `${artist} - ${title}`.trim();
  q = q.replace(/\s*(feat|ft|ft\.|feat\.|&|with).*/gi, "");
  q = q.replace(/\s*[\(\[].*?[\)\]]/g, "");
  q = q.replace(/\s+/g, " ");
  return q.trim();
}

// === YENİ: ƏN YAXŞI VIDEO ID TAPMA (skor sistemi ilə) ===
async function findVideoId(artist: string, title: string): Promise<string | null> {
  const clean = cleanQuery(artist, title);
  const lowerArtist = artist.toLowerCase();
  const lowerTitle = title.toLowerCase();

  const queries = [
    clean,
    `${artist} ${title}`,
    `${title} ${artist}`,
    `${clean} audio`,
    `${clean} official audio`,
    `${clean} topic`,
    `${clean} lyrics`
  ];

  const shuffled = [...SEARCH_INSTANCES].sort(() => Math.random() - 0.5);

  for (const base of shuffled) {
    let bestId: string | null = null;
    let bestScore = -1;

    for (const q of queries) {
      try {
        const url = `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video&fields=videoId,title,author,lengthSeconds,viewCount`;
        const res = await fetchWithTimeout(url);
        if (!res.ok) continue;

        const data: any[] = await res.json();

        for (const item of data) {
          const dur = item.lengthSeconds ?? 0;
          if (dur < 90 || dur > 900) continue;

          const tLower = (item.title ?? "").toLowerCase();
          const aLower = (item.author ?? "").toLowerCase();

          let score = (item.viewCount || 0) / 100000; // view bonus

          if (aLower === `${lowerArtist} - topic`) score += 50;
          else if (aLower.includes(lowerArtist)) score += 20;
          if (aLower.endsWith(" - topic")) score += 30;
          if (aLower.includes("vevo")) score += 10;
          if (tLower.includes(lowerTitle)) score += 20;
          if (tLower.includes("official audio") || tLower.includes("official music")) score += 10;
          if (tLower.includes("lyrics")) score += 3;
          if (tLower.includes("live") || tLower.includes("concert")) score -= 30;
          if (tLower.includes("remix")) score -= 15;

          if (score > bestScore) {
            bestScore = score;
            bestId = item.videoId;

            if (score >= 50) { // çox yaxşıdırsa dərhal qayıt
              console.log(`🎯 PERFECT MATCH [${base}]: ${item.videoId} – ${item.title} (${item.author})`);
              return item.videoId;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (bestId && bestScore > 15) {
      console.log(`🎯 Yaxşı match tapıldı [${base}]: ${bestId} (skor: ${bestScore.toFixed(1)})`);
      return bestId;
    }
  }

  console.log("❌ Video ID tapılmadı");
  return null;
}

// === STREAM LİNKİ (Cobalt + Fallback) ===
async function getStreamUrl(videoId: string): Promise<string | null> {
  const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Cobalt (mp3, ən yaxşı keyfiyyət)
  for (const instance of COBALT_INSTANCES) {
    try {
      const res = await fetchWithTimeout(`${instance}/api/json`, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          url: targetUrl,
          isAudioOnly: true,
          aFormat: "mp3"
        })
      });

      const data = await res.json();
      if (data.url) {
        console.log(`✅ MP3 hazır (Cobalt): ${instance}`);
        return data.url;
      }
    } catch (e) { continue; }
  }

  // Invidious fallback (ən yüksək bitrate opus/m4a)
  for (const base of SEARCH_INSTANCES) {
    try {
      const res = await fetchWithTimeout(`${base}/api/v1/videos/${videoId}`);
      if (!res.ok) continue;
      const data = await res.json();
      const audio = (data.adaptiveFormats || [])
        .filter((f: any) => f.type.includes("audio"))
        .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (audio?.url) {
        console.log(`✅ Stream fallback (Invidious): ${base}`);
        return audio.url;
      }
    } catch (e) { continue; }
  }

  return null;
}

// iTunes fallback (30 saniyəlik preview)
async function searchiTunes(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`);
    const data = await res.json();
    return data.results?.[0]?.previewUrl || null;
  } catch (e) { return null; }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  console.log(`🎵 Axtarılır: ${track.artist} – ${track.title}`);

  const videoId = await findVideoId(track.artist, track.title);

  if (videoId) {
    const streamUrl = await getStreamUrl(videoId);
    if (streamUrl) return streamUrl;
  }

  console.warn("⚠️ iTunes fallback işə düşdü (30san preview)");
  return await searchiTunes(cleanQuery(track.artist, track.title));
}
