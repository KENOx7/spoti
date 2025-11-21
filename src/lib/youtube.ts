import { Track } from "@/types";

// === AYARLAR ===
// Bu serverlər birbaşa MP3 (M4A) axını verir.
// Brauzer bunları "fayl" kimi görür.
const STREAM_SERVERS = [
  "https://inv.tux.pizza",
  "https://vid.puffyan.us",
  "https://invidious.fdn.fr",
  "https://invidious.perennialte.ch",
  "https://yt.artemislena.eu",
  "https://invidious.drgns.space"
];

// Proxy (DuckDuckGo üçün)
const PROXY = "https://api.allorigins.win/raw?url=";

// === 1. ID TAPMAQ (DuckDuckGo - HTML Scraping) ===
async function findVideoId(artist: string, title: string): Promise<string | null> {
  const query = `${artist} - ${title} official audio`;
  console.log(`🕵️ Axtarış: ${query}`);

  // DuckDuckGo-nun yüngül versiyası (reklamsız)
  const targetUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + " site:youtube.com")}`;
  const proxyUrl = `${PROXY}${encodeURIComponent(targetUrl)}`;

  try {
    const res = await fetch(proxyUrl);
    const html = await res.text();

    // HTML içindən ilk YouTube linkini tapırıq
    // v=XXXXXXXXXXX (11 simvol)
    const regex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
    const match = regex.exec(html);

    if (match && match[1]) {
      console.log(`🎯 ID Tapıldı: ${match[1]}`);
      return match[1];
    }
  } catch (e) {
    console.error("Axtarış xətası:", e);
  }
  return null;
}

// === 2. STREAM LİNKİ YARATMAQ (Link Generator) ===
async function checkStreamUrl(videoId: string): Promise<string | null> {
  // Serverləri qarışdırırıq
  const shuffled = [...STREAM_SERVERS].sort(() => Math.random() - 0.5);

  for (const domain of shuffled) {
    try {
      // Bu "sehirli" linkdir. Buna girən kimi musiqi yüklənir.
      // itag=140 -> Yüksək keyfiyyətli audio (m4a)
      const magicUrl = `${domain}/latest_version?id=${videoId}&itag=140`;

      // Yoxlayaq görək link işləyirmi (HEAD sorğusu - yükləmir, sadəcə yoxlayır)
      const res = await fetch(magicUrl, { method: "HEAD" });
      
      if (res.ok) {
        console.log(`✅ Stream Hazırdır: ${domain}`);
        return magicUrl;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// === 3. iTUNES FALLBACK (Ehtiyat) ===
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

  // 1. ID Tap
  const videoId = await findVideoId(cleanArtist, cleanTitle);

  if (videoId) {
    // 2. İşlək Stream Linki Tap
    const streamUrl = await checkStreamUrl(videoId);
    if (streamUrl) return streamUrl;
  }

  // 3. Fallback
  console.warn("⚠️ iTunes Fallback");
  return await searchiTunes(`${cleanArtist} - ${cleanTitle}`);
}
