import { Track } from "@/types";

// 1. PROXY SİYAHISI (Rotasiya ilə işləyir)
// Bu proxy-lər brauzerdən gələn sorğuları gizlədir
const PROXIES = [
  "https://api.allorigins.win/raw?url=",
  "https://thingproxy.freeboard.io/fetch/",
  "https://corsproxy.io/?",
];

// 2. AXTARIŞ METODLARI (Biri işləməsə digəri işə düşür)
// Metod A: DuckDuckGo HTML (Ən sürətli)
// Metod B: Invidious (Ehtiyat)

async function fetchWithProxy(url: string): Promise<string | null> {
  for (const proxy of PROXIES) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url));
      if (res.ok) return await res.text();
    } catch (e) {
      continue;
    }
  }
  return null;
}

// --- METOD A: DUCKDUCKGO HTML (Video ID tapmaq üçün) ---
async function searchDuckDuckGo(query: string): Promise<string | null> {
  const ddgUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query + " site:youtube.com")}`;
  
  const html = await fetchWithProxy(ddgUrl);
  if (!html) return null;

  // HTML içindən YouTube ID-ni tapırıq
  // watch?v=XXXXXXXXXXX (11 simvol)
  const regex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
  const match = regex.exec(html);

  if (match && match[1]) {
    console.log(`✅ DDG Tapdı: ${match[1]}`);
    return match[1];
  }
  return null;
}

// --- METOD B: INVIDIOUS (Son şans) ---
async function searchInvidious(query: string): Promise<string | null> {
  const servers = ["https://inv.tux.pizza", "https://vid.puffyan.us"];
  
  for (const base of servers) {
    try {
      const res = await fetch(`${base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      if (res.ok) {
        const data = await res.json();
        if (data[0]?.videoId) {
            console.log(`✅ Invidious Tapdı: ${data[0].videoId}`);
            return data[0].videoId;
        }
      }
    } catch (e) { continue; }
  }
  return null;
}

// --- ƏSAS FUNKSİYA ---
export async function getYoutubeVideoId(track: Track): Promise<string | null> {
  const query = `${track.artist} - ${track.title}`;
  console.log(`🔍 Axtarış: "${query}"`);

  // 1. Əvvəl DuckDuckGo yoxla (Çox sürətli və bloklanmır)
  let videoId = await searchDuckDuckGo(query);
  
  // 2. Tapmasa Invidious yoxla
  if (!videoId) {
    videoId = await searchInvidious(query);
  }

  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  console.error("❌ Video tapılmadı");
  return null;
}
