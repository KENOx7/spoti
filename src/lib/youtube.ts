import { Track } from "@/types";

// Timeout helper
function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

// Təhlükəsiz fetch (Sadələşdirilmiş)
async function safeFetch(url: string, opts: any = {}, timeout = 8000): Promise<Response> {
  try {
    const signal = timeoutSignal(timeout);
    const res = await fetch(url, { ...opts, signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    throw err;
  }
}

// === PLAN A: Saavn.me (Tam Mahnı) ===
async function searchSaavnMe(query: string): Promise<string | null> {
  try {
    console.log(`🔍 Plan A (Saavn): "${query}"`);
    const url = `https://saavn.me/search/songs?query=${encodeURIComponent(query)}&page=1&limit=1`;
    const res = await safeFetch(url);
    const json = await res.json();

    if (json?.status === "SUCCESS" && json.data?.results?.length > 0) {
      const song = json.data.results[0];
      const urls = song.downloadUrl || song.download_urls;

      if (urls && urls.length > 0) {
        // Ən yüksək keyfiyyəti tapırıq
        const best = urls.find((d: any) => d.quality === "320kbps") 
                  || urls.find((d: any) => d.quality === "160kbps") 
                  || urls[urls.length - 1];

        const finalUrl = best?.link || best?.url;
        if (finalUrl) {
          console.log(`✅ Saavn Tapdı!`);
          return finalUrl;
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

// === PLAN B: iTunes (100% İşləyən Fallback - 30s Preview) ===
async function searchiTunes(query: string): Promise<string | null> {
  try {
    console.log(`🍎 Plan B (iTunes): "${query}"`);
    
    // iTunes axtarışını dəqiqləşdiririk (Mahnı adı + Artist)
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=1`;
    
    // iTunes çox sürətlidir, qısa timeout bəs edir
    const res = await safeFetch(url, {}, 5000);
    const data = await res.json();
    
    if (data.resultCount > 0 && data.results[0].previewUrl) {
      console.log("✅ iTunes Preview Tapıldı");
      return data.results[0].previewUrl;
    }
    return null;
  } catch {
    return null;
  }
}

// === ƏSAS FUNKSİYA ===
export async function getYoutubeAudioUrl(track: Track): Promise<string | null> {
  // Sorğunun təmizlənməsi
  const cleanTitle = track.title
    .replace(/\(.*?\)/g, "") 
    .replace(/feat\..*/i, "") 
    .replace(/ft\..*/i, "")
    .trim();

  const query = `${cleanTitle} ${track.artist}`;

  // 1. Saavn yoxla (Tam mahnı üçün)
  const saavn = await searchSaavnMe(query);
  if (saavn) return saavn;

  // 2. iTunes yoxla (Ən azından səs gəlsin)
  const itunes = await searchiTunes(query);
  if (itunes) return itunes;

  console.error("❌ Mahnı heç bir yerdə tapılmadı.");
  return null;
}
