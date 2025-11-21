// Bu sətir Vercel-ə deyir ki, Node.js yox, Edge istifadə et (Daha sürətli və fetch problemi yoxdur)
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Sorğu URL-dən parametrləri alırıq
  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // search | stream
  const q = url.searchParams.get("q");
  const id = url.searchParams.get("id");

  // CORS Başlıqları (Frontend rahat oxusun deyə)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Preflight (OPTIONS) sorğusuna cavab
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

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

  // Serverləri yoxlayan dövr
  for (const base of PIPED_INSTANCES) {
    try {
      let fetchUrl = "";
      
      if (type === 'search') {
        fetchUrl = `${base}/search?q=${encodeURIComponent(q)}&filter=music_songs`;
      } else if (type === 'stream') {
        fetchUrl = `${base}/streams/${id}`;
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid type parameter" }), 
          { status: 400, headers: corsHeaders }
        );
      }

      // Sorğu göndəririk
      const response = await fetch(fetchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Compatible; VercelEdge/1.0)"
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Uğurlu cavab qaytarırıq
        return new Response(JSON.stringify(data), { 
          status: 200, 
          headers: corsHeaders 
        });
      }
    } catch (e) {
      // Bu server xəta verdi, növbətiyə keçirik
      console.log(`Error with ${base}:`, e);
      continue;
    }
  }

  // Heç biri işləmədisə
  return new Response(
    JSON.stringify({ error: "Bütün serverlər məşğuldur, yenidən cəhd edin." }), 
    { status: 503, headers: corsHeaders }
  );
}
