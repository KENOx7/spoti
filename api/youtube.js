export default async function handler(req, res) {
    // CORS başlıqlarını əlavə edirik (Frontend rahat oxusun deyə)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    // OPTIONS sorğusu gəlsə dərhal cavab ver (Preflight check)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    const { q, id, type } = req.query; // type: 'search' | 'stream'
  
    // Stabil Serverlər Siyahısı
    const PIPED_INSTANCES = [
      "https://api.piped.ot.ax",
      "https://api.piped.projectsegfau.lt",
      "https://pipedapi.kavin.rocks",
      "https://pipedapi.moomoo.me",
      "https://pipedapi.smnz.de",
      "https://pipedapi.adminforge.de",
      "https://api.piped.privacydev.net",
      "https://pipedapi.ducks.party"
    ];
  
    // Serverləri yoxlayan funksiya
    for (const base of PIPED_INSTANCES) {
      try {
        let url = "";
        
        if (type === 'search') {
          url = `${base}/search?q=${encodeURIComponent(q)}&filter=music_songs`;
        } else if (type === 'stream') {
          url = `${base}/streams/${id}`;
        } else {
          return res.status(400).json({ error: "Invalid type" });
        }
  
        // Timeout 4 saniyə
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
  
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });
  
        clearTimeout(timeoutId);
  
        if (response.ok) {
          const data = await response.json();
          // Uğurlu cavab
          return res.status(200).json(data);
        }
      } catch (e) {
        console.log(`Error with ${base}:`, e.message);
        continue; // Növbəti serverə keç
      }
    }
  
    return res.status(500).json({ error: "Bütün serverlər məşğuldur." });
  }