// Dynamic Active Tunnel API Base & Fallback Pipeline
export const API_BASE = 'https://tube-sufficiently-occupations-viii.trycloudflare.com';
export const RENDER_BACKEND = 'https://backend-proxy-server.onrender.com';

export async function extractVideoInfo(youtubeUrl) {
  try {
    let videoId = '';
    const trimmedUrl = youtubeUrl.trim();
    
    // Clean 11-character video ID extraction
    const match = trimmedUrl.match(/(?:v=|\/v\/|embed\/|youtu\.be\/|shorts\/|^)([\w-]{11})/);
    videoId = match ? match[1] : trimmedUrl.split('&')[0].split('?')[0].trim();
    
    if (!videoId || videoId.length !== 11) {
      throw new Error("Invalid YouTube URL or Video ID");
    }

    let data = null;
    let lastError = null;

    // Prioritize direct fast tunnel URL, with fallback to Render backend
    const endpoints = [
      `${API_BASE}/api/getVideoJson?videoId=${videoId}`,
      `${RENDER_BACKEND}/api/getVideoJson?videoId=${videoId}`
    ];

    // Query Render health check to discover any newly updated tunnel URL dynamically
    try {
      const hRes = await fetch(`${RENDER_BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
      if (hRes.ok) {
        const hData = await hRes.json();
        if (hData.activeTunnelUrl) {
          const dynamicEndpoint = `${hData.activeTunnelUrl}/api/getVideoJson?videoId=${videoId}`;
          if (!endpoints.includes(dynamicEndpoint)) {
            endpoints.unshift(dynamicEndpoint);
          }
        }
      }
    } catch (e) {}

    for (const reqUrl of endpoints) {
      try {
        console.log('⚡ Attempting extraction via endpoint:', reqUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(reqUrl, {
          headers: { 'ngrok-skip-browser-warning': '69420' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.formats && json.formats.length > 0) {
            data = json;
            break;
          }
        }
      } catch (err) {
        console.warn('Endpoint extraction attempt failed:', reqUrl, err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw new Error(lastError?.message || "Failed to extract video information. Please try again.");
    }

    // Handle duration formatting
    let durationStr = data.duration;
    if (typeof data.duration === 'number' || (typeof data.duration === 'string' && !data.duration.includes(':'))) {
      const sec = parseInt(data.duration || 0);
      const min = Math.floor(sec / 60);
      const remSec = sec % 60;
      durationStr = `${min}:${remSec.toString().padStart(2, '0')}`;
    }
    
    return {
        title: data.title,
        thumbnail: data.thumbnail,
        view_count: data.view_count,
        duration: durationStr,
        formats: data.formats
    };
  } catch (err) {
    console.error('Extraction Error:', err);
    throw new Error(err.message || 'Failed to extract video. Please check the URL and try again.');
  }
}
