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

    // Call our proxy backend to bypass CORS and spoof Android User-Agent
    const apiBase = 'https://a9ce8c0350b94146-122-183-45-55.serveousercontent.com';
    const res = await fetch(`${apiBase}/api/getVideoJson?videoId=${videoId}`);
    
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
