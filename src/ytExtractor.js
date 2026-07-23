export const API_BASE = 'https://halloween-looksmart-henderson-sara.trycloudflare.com';

export async function extractVideoInfo(youtubeUrl) {
  try {
    
    // Extract video ID
    let videoId = '';
    const trimmedUrl = youtubeUrl.trim();
    const urlObj = new URL(trimmedUrl);
    if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
    } else {
        videoId = urlObj.searchParams.get('v');
    }
    
    if (!videoId && youtubeUrl.length === 11) {
        videoId = youtubeUrl;
    }
    
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }

    // Generate or retrieve client-side PO Token from browser session
    let poToken = '';
    try {
      if (window.yt && window.yt.config_ && window.yt.config_.PO_TOKEN) {
        poToken = window.yt.config_.PO_TOKEN;
      } else {
        // Generate client-side visitor session token
        poToken = btoa(JSON.stringify({
          ts: Date.now(),
          client: 'web_android',
          rand: Math.random().toString(36).substring(2)
        })).replace(/=/g, '');
      }
    } catch (e) {
      console.warn('PO Token generation fallback:', e.message);
    }

    // Call our proxy backend with videoId and client PO Token to bypass bot checks
    const reqUrl = `${API_BASE}/api/getVideoJson?videoId=${videoId}${poToken ? `&poToken=${encodeURIComponent(poToken)}` : ''}`;
    const res = await fetch(reqUrl, {
      headers: {
        'ngrok-skip-browser-warning': '69420'
      }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch video info: ${res.statusText}`);
    }
    
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Handle duration (can be string or number)
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
    throw new Error('Failed to extract video. Please check the URL and try again.');
  }
}
