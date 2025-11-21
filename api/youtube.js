export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const q = url.searchParams.get("q");
  const id = url.searchParams.get("id");

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Vercel-i bloklamayan güclü Invidious serverləri
  const INSTANCES = [
    "https://inv.tux.pizza",
    "https://invidious.projectsegfau.lt",
    "https://vid.puffyan.us",
    "https://invidious.fdn.fr",
    "https://invidious.perennialte.ch",
    "https://yt.artemislena.eu"
  ];

  for (const base of INSTANCES) {
    try {
      let fetchUrl = "";
      
      // Invidious API formatı
      if (type === 'search') {
        fetchUrl = `${base}/api/v1/search?q=${encodeURIComponent(q)}&type=video`;
      } else if (type === 'stream') {
        fetchUrl = `${base}/api/v1/videos/${id}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
    } catch (e) {
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: "Serverlər cavab vermir" }), 
    { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
