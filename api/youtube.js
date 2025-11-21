export const config = {
    runtime: 'edge', // Ən vacib sətir budur!
  };
  
  export default async function handler(request) {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const q = url.searchParams.get("q");
    const id = url.searchParams.get("id");
  
    // CORS - Frontend-ə icazə veririk
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
  
    // Preflight sorğusu üçün
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
  
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
  
    for (const base of PIPED_INSTANCES) {
      try {
        let fetchUrl = "";
        
        if (type === 'search') {
          fetchUrl = `${base}/search?q=${encodeURIComponent(q)}&filter=music_songs`;
        } else if (type === 'stream') {
          fetchUrl = `${base}/streams/${id}`;
        } else {
          return new Response(JSON.stringify({ error: "Invalid type" }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
  
        // Timeout 3 saniyə
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
  
        const response = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Compatible; VercelEdge/1.0)"
          }
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
      JSON.stringify({ error: "No servers available" }), 
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
