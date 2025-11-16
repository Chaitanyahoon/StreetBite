export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    return new Response('API Key not configured', { status: 500 })
  }

  const mapsUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
  
  return new Response(
    `window.location.href = '${mapsUrl}'; 
     (function() {
       var script = document.createElement('script');
       script.src = '${mapsUrl}';
       script.async = true;
       script.defer = true;
       document.head.appendChild(script);
     })();`,
    {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  )
}
