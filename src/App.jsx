import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Download, Video, Music, Clock, Eye, AlertCircle, Play, ChevronRight, Clipboard, Check, X, QrCode, Filter, Volume2, Share2, Sun, Moon, Trash2, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractVideoInfo, API_BASE } from './ytExtractor';

// Toast Notification Component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.9, x: '-50%' }}
      animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
      exit={{ opacity: 0, y: -10, scale: 0.9, x: '-50%' }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="fixed bottom-6 left-1/2 z-50 bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-blue-500/25 flex items-center gap-3 font-semibold text-sm backdrop-blur-xl"
    >
      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
      {message}
    </motion.div>
  );
}

// Skeleton Loader Component
function SkeletonLoader({ isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full max-w-5xl rounded-[32px] p-6 md:p-10 border transition-colors duration-300 ${
        isDark ? 'bg-[#0f1424] border-blue-950/40' : 'bg-white border-blue-50'
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="skeleton w-full aspect-video rounded-[20px]" />
          <div className="skeleton h-6 w-3/4 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="flex gap-3">
            <div className="skeleton h-8 w-24 rounded-lg" />
            <div className="skeleton h-8 w-20 rounded-lg" />
          </div>
        </div>
        <div className="w-full lg:w-2/3 flex flex-col gap-4">
          <div className="skeleton h-5 w-32 rounded-lg" />
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton h-16 w-full rounded-[20px]" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Quality Badge Component
function QualityBadge({ resolution }) {
  const res = resolution?.toLowerCase() || '';
  let color = 'bg-gray-100 text-gray-600';
  let label = 'SD';
  
  if (res.includes('2160') || res.includes('3840') || res.includes('4k')) {
    color = 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    label = '4K';
  } else if (res.includes('1440')) {
    color = 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    label = '2K';
  } else if (res.includes('1080') || res.includes('1920')) {
    color = 'bg-violet-50 text-violet-700 ring-1 ring-violet-200';
    label = 'FHD';
  } else if (res.includes('720') || res.includes('1280')) {
    color = 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    label = 'HD';
  }

  return (
    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${color}`}>
      {label}
    </span>
  );
}

// Apple-style Modal for Video Preview & Audio Visualizer
function PreviewModal({ activePreview, onClose, isDark }) {
  if (!activePreview) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl relative p-6 transition-colors duration-300 border ${
          isDark ? 'bg-[#0f1424] border-blue-950/40 text-white' : 'bg-white border-blue-50 text-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className={`absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-extrabold text-xl mb-4 pr-12 line-clamp-1">{activePreview.title}</h3>

        <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center relative ring-1 ring-black/5">
          {activePreview.type === 'video' ? (
            <video src={activePreview.url} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-blue-950 to-black text-white p-6 relative overflow-hidden">
              {/* Spinning Vinyl Record Disc */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-40 h-40 rounded-full bg-gradient-to-r from-gray-800 via-black to-gray-800 border-4 border-gray-700 shadow-2xl flex items-center justify-center relative mb-6"
              >
                <div className="w-12 h-12 rounded-full bg-[#0A84FF]/20 flex items-center justify-center border-4 border-gray-900">
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </motion.div>

              <Volume2 className="w-8 h-8 text-[#0A84FF] animate-pulse mb-2" />
              <span className="text-sm font-bold text-gray-400">Audio playback streaming...</span>

              {/* Fake Audio Waveform Jumpers */}
              <div className="flex gap-1.5 items-end h-12 mt-6">
                {[...Array(12)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [12, Math.random() * 40 + 10, 12] }}
                    transition={{ duration: 0.6 + i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-gradient-to-t from-[#0A84FF] to-[#5AC8FA] rounded-full"
                  />
                ))}
              </div>

              <audio src={activePreview.url} controls autoPlay className="w-3/4 absolute bottom-6 opacity-80" />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// QR Code Generator Modal
function QrModal({ showQr, onClose, isDark }) {
  const [copied, setCopied] = useState(false);
  if (!showQr) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(showQr)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(showQr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className={`w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative flex flex-col items-center border transition-colors duration-300 ${
          isDark ? 'bg-[#0f1424] border-blue-950/40 text-white' : 'bg-white border-blue-50 text-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-black'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <QrCode className="w-8 h-8 text-[#0A84FF] mb-2 animate-pulse mt-2" />
        <h3 className="font-extrabold text-lg mb-1">Scan QR Code</h3>
        <p className={`text-xs text-center mb-6 font-semibold ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Download directly on your phone or tablet</p>

        <div className="w-56 h-56 bg-white rounded-2xl border border-blue-100/50 flex items-center justify-center p-4 shadow-inner relative overflow-hidden group">
          <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
        </div>

        <div className="w-full mt-6 flex gap-2">
          <button 
            onClick={handleCopy}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border ${
              isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
          <a 
            href={showQr} 
            target="_blank" 
            rel="noreferrer"
            className="flex-1 py-3 px-4 bg-[#0A84FF] hover:bg-[#007AFF] text-white rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-500/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            Open Link
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const [showQr, setShowQr] = useState(null);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [pasted, setPasted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  // Format filter tabs: 'all' | 'mp4' | 'webm' | 'audio'
  const [activeFilter, setActiveFilter] = useState('all');

  // Load theme & history on mount
  useEffect(() => {
    const saved = localStorage.getItem('ytdown_history');
    if (saved) setHistory(JSON.parse(saved));

    const savedTheme = localStorage.getItem('ytdown_dark');
    if (savedTheme) {
      setIsDark(savedTheme === 'true');
    }
  }, []);

  // Sync dark class on root html element for Tailwind dark: utility classes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('ytdown_dark', String(nextDark));
    showToast(`${nextDark ? 'Space Midnight' : 'Pure White'} theme active`);
  };

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
        showToast('Link pasted!');
      }
    } catch { /* clipboard permission denied */ }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setActivePreview(null);
    setActiveFilter('all');

    try {
      const data = await extractVideoInfo(url);
      setVideoInfo(data);
      showToast('Video details fetched successfully!');
      
      const newHistory = [
        { 
          title: data.title, 
          thumbnail: data.thumbnail, 
          url, 
          date: new Date().toISOString(),
          uploader: data.uploader || 'YouTube Creator'
        }, 
        ...history.filter(h => h.url !== url)
      ].slice(0, 6);
      
      setHistory(newHistory);
      localStorage.setItem('ytdown_history', JSON.stringify(newHistory));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = async (historyUrl) => {
    setUrl(historyUrl);
    setLoading(true);
    setError(null);
    setVideoInfo(null);
    setActivePreview(null);
    setActiveFilter('all');

    try {
      const data = await extractVideoInfo(historyUrl);
      setVideoInfo(data);
      showToast('Video details fetched successfully!');
      
      const newHistory = [
        { 
          title: data.title, 
          thumbnail: data.thumbnail, 
          url: historyUrl, 
          date: new Date().toISOString(),
          uploader: data.uploader || 'YouTube Creator'
        }, 
        ...history.filter(h => h.url !== historyUrl)
      ].slice(0, 6);
      setHistory(newHistory);
      localStorage.setItem('ytdown_history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = (e, historyUrl) => {
    e.stopPropagation(); // Avoid triggering card fetch onClick
    const updated = history.filter(h => h.url !== historyUrl);
    setHistory(updated);
    localStorage.setItem('ytdown_history', JSON.stringify(updated));
    showToast('Removed from history');
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('ytdown_history');
    showToast('Search history cleared');
  };

  const handleDownloadClick = (type, directUrl) => {
    showToast(`${type} download initiated!`);
    
    // Copy proxy/direct link helper or show share status
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directUrl);
      showToast('Download link copied to clipboard!');
    }
  };

  const handleDownload = async (fmt, extension) => {
    const filename = `${videoInfo.title}.${extension}`;
    const isLarge = fmt.filesize && fmt.filesize > 100 * 1024 * 1024; // > 100MB
    
    if (isLarge) {
      showToast('Redirecting to direct download...');
      window.open(fmt.url, '_blank');
      return;
    }

    try {
      showToast('Downloading via secure proxy...');
      const downloadUrl = `${API_BASE}/api/download?url=${encodeURIComponent(fmt.url)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(downloadUrl, {
        headers: {
          'ngrok-skip-browser-warning': '69420'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = filename;
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLink.remove();
      window.URL.revokeObjectURL(blobUrl);
      showToast('Download completed!');
    } catch (err) {
      console.error('Proxy download failed:', err);
      showToast('Proxy failed, opening direct link...');
      window.open(fmt.url, '_blank');
    }
  };

  const formatViews = (views) => {
    if (!views) return 'N/A';
    return new Intl.NumberFormat('en-US', { notation: "compact" }).format(views);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '? MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Date Formatter helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.length === 8) {
      // YYYYMMDD parsing
      const y = dateStr.slice(0, 4);
      const m = dateStr.slice(4, 6);
      const d = dateStr.slice(6, 8);
      return new Date(`${y}-${m}-${d}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const allFormats = videoInfo?.formats || [];
  
  // Filtering Logic
  const filteredFormats = allFormats.filter(fmt => {
    if (activeFilter === 'audio') {
      return !fmt.vcodec && fmt.acodec;
    }
    if (activeFilter === 'mp4') {
      return fmt.vcodec && fmt.ext === 'mp4';
    }
    if (activeFilter === 'webm') {
      return fmt.vcodec && fmt.ext === 'webm';
    }
    return true;
  });

  const videoFormats = activeFilter === 'all' 
    ? filteredFormats.filter(f => f.vcodec).slice(0, 6)
    : filteredFormats.filter(f => f.vcodec);

  const audioFormats = activeFilter === 'all'
    ? filteredFormats.filter(f => !f.vcodec && f.acodec).slice(0, 4)
    : filteredFormats.filter(f => !f.vcodec && f.acodec);

  // Find max size for visual comparison bar
  const allSizes = [...videoFormats, ...audioFormats].map(f => f.filesize || 0);
  const maxSize = Math.max(...allSizes, 1);

  const SPRING = { type: "spring", stiffness: 350, damping: 25 };
  const SMOOTH = { type: "spring", stiffness: 200, damping: 20 };
  const BOUNCY = { type: "spring", stiffness: 500, damping: 15 };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], staggerChildren: 0.07 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { ...SPRING, duration: 0.5 } }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 flex flex-col items-center overflow-x-hidden font-sans relative transition-colors duration-500 selection:bg-[#0A84FF] selection:text-white ${
      isDark ? 'bg-[#030712] text-white' : 'bg-[#f8faff] text-black'
    }`}>
      
      {/* Apple-style ambient background blobs — ALWAYS FLOATING */}
      <div className="fixed top-[-5%] left-[-8%] w-[600px] h-[600px] rounded-full bg-[#0A84FF]/[0.07] blur-[150px] pointer-events-none float-slow" />
      <div className="fixed top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#5AC8FA]/[0.07] blur-[130px] pointer-events-none float-medium" style={{ animationDelay: '1s' }} />
      <div className="fixed bottom-[-5%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#007AFF]/[0.05] blur-[120px] pointer-events-none float-fast" style={{ animationDelay: '2s' }} />

      {/* Toast popup */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Media Playback Modal */}
      <AnimatePresence>
        {activePreview && <PreviewModal activePreview={activePreview} onClose={() => setActivePreview(null)} isDark={isDark} />}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQr && <QrModal showQr={showQr} onClose={() => setShowQr(null)} isDark={isDark} />}
      </AnimatePresence>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl flex items-center justify-between mb-16 mt-4 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 90, scale: 1.1 }} 
            whileTap={{ scale: 0.9 }}
            transition={BOUNCY}
            className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#5AC8FA] flex items-center justify-center shadow-lg shadow-blue-500/20 glow-pulse"
          >
            <Video className="text-white w-5 h-5" />
          </motion.div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Stream<span className="text-[#0A84FF]">Pure</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Switcher Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all shadow-sm ${
              isDark ? 'bg-gray-900 border-gray-800 text-yellow-400 hover:text-yellow-300' : 'bg-white border-blue-100 text-gray-400 hover:text-black'
            }`}
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </motion.button>

          <motion.a 
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noreferrer" 
            className={`text-xs font-bold px-4 py-2 border rounded-full transition-all shadow-sm ${
              isDark ? 'bg-gray-900 border-gray-800 text-[#5AC8FA] hover:border-[#0A84FF]' : 'bg-white/80 backdrop-blur-md border border-blue-100 text-[#0A84FF] hover:bg-blue-50 hover:border-blue-200'
            }`}
          >
            Powered by yt-dlp
          </motion.a>
        </div>
      </motion.header>

      {/* Main */}
      <motion.main 
        layout
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl flex flex-col items-center relative z-10"
      >
        {/* Hero */}
        <AnimatePresence mode="wait">
          {!videoInfo && !loading && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full"
            >
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...SMOOTH }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-center mb-5 tracking-tighter leading-[1.05]"
              >
                Download Media.
                <br/>
                <span className="bg-gradient-to-r from-[#0A84FF] via-[#5AC8FA] to-[#0A84FF] bg-clip-text text-transparent animated-gradient-text">Zero Distractions.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ...SMOOTH }}
                className="text-gray-500 text-center mb-14 max-w-lg text-base font-medium leading-relaxed"
              >
                Paste a YouTube link. Get high-quality video & audio downloads in seconds.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <motion.form 
          layout
          variants={itemVariants} 
          onSubmit={handleSearch} 
          className="w-full max-w-3xl mb-10 relative"
        >
          <motion.div 
            whileHover={{ boxShadow: "0 12px 40px -8px rgba(10,132,255,0.15)" }}
            transition={{ duration: 0.3 }}
            className={`relative flex items-center border rounded-2xl p-1.5 shadow-sm transition-all duration-500 ${
              isDark 
                ? 'bg-gray-950/80 backdrop-blur-xl border-blue-900/40 shadow-blue-500/[0.01] focus-within:border-[#0A84FF]/40 focus-within:shadow-blue-500/[0.12]' 
                : 'bg-white/80 backdrop-blur-xl border-blue-100/60 shadow-blue-500/[0.03] focus-within:border-[#0A84FF]/30 focus-within:shadow-blue-500/[0.08]'
            }`}
          >
            {/* Animated pulsing ring behind search bar */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0A84FF]/10 via-[#5AC8FA]/10 to-[#0A84FF]/10 rounded-2xl pulse-ring -z-10" />
            
            <Search className="w-5 h-5 text-[#0A84FF]/50 ml-4 shrink-0" />
            
            <input 
              type="text" 
              placeholder="Paste YouTube URL here..." 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`flex-1 bg-transparent border-none outline-none px-3 py-4 text-base font-medium placeholder:text-gray-400 min-w-0 ${
                isDark ? 'text-white' : 'text-black'
              }`}
            />

            {/* Paste Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePaste}
              className="p-3 text-[#0A84FF]/50 hover:text-[#0A84FF] hover:bg-blue-50/10 rounded-xl transition-all mr-1 shrink-0"
              title="Paste from clipboard"
            >
              {pasted ? <Check className="w-5 h-5 text-emerald-500" /> : <Clipboard className="w-5 h-5" />}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: "0 8px 25px -5px rgba(10,132,255,0.4)" }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || !url}
              className="relative bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] text-white px-7 py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-20 overflow-hidden flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 btn-shimmer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch'}
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl mb-8"
            >
              <div className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-semibold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="flex-1">{error}</p>
                <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skeleton Loader */}
        <AnimatePresence>
          {loading && <SkeletonLoader isDark={isDark} />}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {videoInfo && (
            <motion.div 
              layout
              key="results"
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-5xl shadow-lg border rounded-[32px] p-6 md:p-10 relative overflow-hidden transition-colors duration-300 ${
                isDark ? 'bg-[#0f1424] border-blue-950/40 shadow-blue-500/[0.01]' : 'bg-white border-blue-50 shadow-blue-500/[0.02]'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-10">
                
                {/* Thumbnail & Info */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, ...SPRING }}
                  className="w-full lg:w-[35%] flex flex-col gap-5"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.03, rotateX: 2, rotateY: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.2, ...BOUNCY }}
                    style={{ perspective: 1000 }}
                    className="relative rounded-[20px] overflow-hidden aspect-video bg-gray-100 flex items-center justify-center shadow-lg shadow-blue-500/[0.08] group cursor-pointer ring-1 ring-black/[0.04]"
                    onClick={() => setActivePreview({ url: videoFormats[0]?.url || allFormats[0]?.url, type: 'video', title: videoInfo.title })}
                  >
                    <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute bottom-3 right-3 bg-white/90 text-black px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-lg backdrop-blur-md"
                    >
                      {videoInfo.duration}
                    </motion.div>
                    
                    {/* Play overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.div whileHover={{ scale: 1.1 }} className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl">
                        <Play className="w-6 h-6 text-[#0A84FF] ml-1" fill="currentColor" />
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  <div className="flex flex-col gap-3">
                    <h3 className="font-extrabold text-xl line-clamp-3 leading-snug text-black tracking-tight dark:text-white">
                      {videoInfo.title}
                    </h3>
                    
                    {/* Detailed Info Panel: Creator & Upload Date */}
                    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-blue-50/30 border border-blue-500/10 text-xs font-semibold text-gray-500 dark:bg-blue-950/20 dark:border-blue-900/10">
                      {videoInfo.uploader && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#0A84FF]" />
                          <span>Channel: <strong className="text-black dark:text-white">{videoInfo.uploader}</strong></span>
                        </div>
                      )}
                      {videoInfo.upload_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#0A84FF]" />
                          <span>Uploaded: <strong className="text-black dark:text-white">{formatDate(videoInfo.upload_date)}</strong></span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-bold">
                      <span className="flex items-center gap-1.5 bg-blue-50/50 text-[#0A84FF] px-3 py-2 rounded-xl dark:bg-blue-950/20">
                        <Eye className="w-3.5 h-3.5"/> {formatViews(videoInfo.view_count)}
                      </span>
                      <span className="flex items-center gap-1.5 bg-blue-50/50 text-[#0A84FF] px-3 py-2 rounded-xl dark:bg-blue-950/20">
                        <Clock className="w-3.5 h-3.5"/> {videoInfo.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Download Options */}
                <div className="w-full lg:w-[65%] flex flex-col gap-6">
                  
                  {/* Format Filter Tabs */}
                  <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3 overflow-x-auto scrollbar-none">
                    <span className="text-gray-400 font-extrabold text-[10px] uppercase tracking-wider mr-2 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#0A84FF]" /> Filter
                    </span>
                    {[
                      { id: 'all', label: 'All Formats' },
                      { id: 'mp4', label: 'MP4 Video' },
                      { id: 'webm', label: 'WebM Video' },
                      { id: 'audio', label: 'Audio Only' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                          activeFilter === tab.id 
                            ? 'bg-[#0A84FF] text-white shadow-md shadow-blue-500/20' 
                            : isDark
                              ? 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                              : 'bg-gray-50 text-gray-500 hover:text-black hover:bg-gray-100 border border-gray-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Video List */}
                  {videoFormats.length > 0 && (
                    <motion.div layout variants={containerVariants} initial="hidden" animate="visible">
                      <motion.h4 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, ...SPRING }}
                        className="flex items-center gap-2 font-extrabold mb-4 text-xs tracking-[0.15em] uppercase text-black dark:text-white"
                      >
                        <Video className="w-4 h-4 text-[#0A84FF] animate-pulse"/> Video Quality
                      </motion.h4>
                      <div className="flex flex-col gap-2.5">
                        {videoFormats.map((fmt, i) => (
                          <motion.div 
                            variants={itemVariants}
                            whileHover={{ x: 6, scale: 1.01, boxShadow: "0 8px 25px -5px rgba(10,132,255,0.08)" }}
                            transition={SPRING}
                            key={i} 
                            className={`p-4 rounded-2xl flex items-center justify-between gap-3 group border transition-all duration-300 ${
                              isDark
                                ? 'bg-gray-950/40 border-blue-950/20 hover:border-blue-900/50'
                                : 'bg-white border-blue-50 hover:border-blue-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <QualityBadge resolution={fmt.resolution} />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-extrabold text-base leading-none text-black dark:text-white">{fmt.resolution}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-gray-400 font-bold tracking-wide">{fmt.ext.toUpperCase()} • {formatSize(fmt.filesize)}</span>
                                  {/* Size comparison progress bar */}
                                  {fmt.filesize && (
                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(fmt.filesize / maxSize) * 100}%` }}
                                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                                        className="h-full bg-gradient-to-r from-[#0A84FF]/30 to-[#5AC8FA]/30 rounded-full" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                               {/* Open Preview Modal */}
                               <motion.button
                                 whileHover={{ scale: 1.15, rotate: 5 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => { setActivePreview({ url: fmt.url, type: 'video', title: videoInfo.title }); showToast('Opening video preview...'); }}
                                 className="w-9 h-9 bg-blue-50 text-[#0A84FF] rounded-xl hover:bg-[#0A84FF] hover:text-white transition-all duration-300 flex items-center justify-center dark:bg-blue-950/30"
                                 title="Watch Preview"
                               >
                                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                               </motion.button>
                               {/* Open QR Code Generator */}
                               <motion.button
                                 whileHover={{ scale: 1.15 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => { setShowQr(fmt.url); showToast('QR Code generated!'); }}
                                 className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                   isDark 
                                     ? 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-[#0A84FF] hover:text-white' 
                                     : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-[#0A84FF] hover:text-white'
                                 }`}
                                 title="Generate Mobile QR Code"
                               >
                                 <QrCode className="w-3.5 h-3.5" />
                               </motion.button>
                               <motion.button 
                                 whileHover={{ scale: 1.15, rotate: -5 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => handleDownloadClick('Direct', fmt.url)}
                                 className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                   isDark 
                                     ? 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white' 
                                     : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-800 hover:text-white'
                                 }`}
                                 title="Copy Download Link"
                               >
                                 <Share2 className="w-3.5 h-3.5" />
                               </motion.button>
                               <motion.button 
                                 whileHover={{ scale: 1.15 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => handleDownload(fmt, fmt.ext)}
                                 className="w-9 h-9 bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] text-white rounded-xl transition-all duration-300 flex items-center justify-center shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 glow-pulse"
                                 title="Download Video"
                               >
                                 <Download className="w-3.5 h-3.5" />
                               </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Audio List */}
                  {audioFormats.length > 0 && (
                    <motion.div layout variants={containerVariants} initial="hidden" animate="visible" className="mt-4">
                      <motion.h4 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, ...SPRING }}
                        className="flex items-center gap-2 font-extrabold mb-4 text-xs tracking-[0.15em] uppercase text-black dark:text-white"
                      >
                        <Music className="w-4 h-4 text-[#5AC8FA] animate-pulse"/> Audio Only
                      </motion.h4>
                      <div className="flex flex-col gap-2.5">
                        {audioFormats.map((fmt, i) => (
                          <motion.div 
                            variants={itemVariants}
                            whileHover={{ x: 6, scale: 1.01, boxShadow: "0 8px 25px -5px rgba(90,200,250,0.08)" }}
                            transition={SPRING}
                            key={i} 
                            className={`p-4 rounded-2xl flex items-center justify-between gap-3 group border transition-all duration-300 ${
                              isDark
                                ? 'bg-gray-950/40 border-blue-950/20 hover:border-blue-900/50'
                                : 'bg-white border-blue-50 hover:border-blue-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider bg-sky-50 text-sky-700 ring-1 ring-sky-200">
                                HQ
                              </span>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-extrabold text-base leading-none text-black dark:text-white">Audio Stream</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-gray-400 font-bold tracking-wide">{fmt.ext.toUpperCase()} • {formatSize(fmt.filesize)}</span>
                                  {fmt.filesize && (
                                    <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(fmt.filesize / maxSize) * 100}%` }}
                                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6 }}
                                        className="h-full bg-sky-200 rounded-full" 
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                               {/* Open Preview Modal for Audio */}
                               <motion.button
                                 whileHover={{ scale: 1.15, rotate: 5 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => { setActivePreview({ url: fmt.url, type: 'audio', title: videoInfo.title }); showToast('Opening music player...'); }}
                                 className="w-9 h-9 bg-sky-50 text-sky-500 rounded-xl hover:bg-sky-500 hover:text-white transition-all duration-300 flex items-center justify-center dark:bg-sky-950/30"
                                 title="Listen Preview"
                               >
                                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                               </motion.button>
                               {/* Open QR Code Generator */}
                               <motion.button
                                 whileHover={{ scale: 1.15 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => { setShowQr(fmt.url); showToast('QR Code generated!'); }}
                                 className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                   isDark 
                                     ? 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-sky-500 hover:text-white' 
                                     : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-sky-500 hover:text-white'
                                 }`}
                                 title="Generate Mobile QR Code"
                               >
                                 <QrCode className="w-3.5 h-3.5" />
                               </motion.button>
                               <motion.button 
                                 whileHover={{ scale: 1.15, rotate: -5 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => handleDownloadClick('Direct audio', fmt.url)}
                                 className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                                   isDark 
                                     ? 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-white' 
                                     : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-800 hover:text-white'
                                 }`}
                                 title="Copy Download Link"
                               >
                                 <Share2 className="w-3.5 h-3.5" />
                               </motion.button>
                               <motion.button 
                                 whileHover={{ scale: 1.15 }}
                                 whileTap={{ scale: 0.85 }}
                                 onClick={() => handleDownload(fmt, fmt.ext)}
                                 className="w-9 h-9 bg-gradient-to-r from-[#0A84FF] to-[#5AC8FA] text-white rounded-xl transition-all duration-300 flex items-center justify-center shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 glow-pulse"
                                 title="Download Audio"
                               >
                                 <Download className="w-3.5 h-3.5" />
                               </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        <AnimatePresence>
          {!videoInfo && !loading && history.length > 0 && (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl mt-16"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
                  Recent Downloads <ChevronRight className="w-4 h-4 text-gray-300" />
                </h3>
                
                {/* Clear History Button */}
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearAllHistory}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-gray-900/50 border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-900/30'
                      : 'bg-white border-blue-50 text-gray-500 hover:text-red-500 hover:border-red-100'
                  }`}
                >
                  Clear History
                </motion.button>
              </div>

              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item, i) => (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -6 }}
                    transition={SPRING}
                    key={i} 
                    onClick={() => handleHistoryClick(item.url)}
                    className={`flex flex-col text-left p-4 rounded-[24px] border transition-all duration-500 group relative cursor-pointer ${
                      isDark
                        ? 'bg-gray-950/40 border-blue-950/20 hover:shadow-xl hover:shadow-blue-500/[0.03] hover:border-blue-900/40'
                        : 'bg-white border-blue-50 hover:shadow-xl hover:shadow-blue-500/[0.06] hover:border-blue-100'
                    }`}
                  >
                    {/* Delete Item Button */}
                    <motion.button 
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={(e) => deleteHistoryItem(e, item.url)}
                      className={`absolute top-6 right-6 z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md ${
                        isDark 
                          ? 'bg-gray-900 text-gray-400 hover:text-red-400 hover:bg-gray-800' 
                          : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>

                    <div className="w-full aspect-video bg-gray-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative ring-1 ring-black/[0.04]">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <Video className="w-8 h-8 text-gray-300 group-hover:text-black group-hover:scale-110 transition-all duration-300" />
                      )}
                    </div>
                    
                    <span className="font-bold text-sm line-clamp-2 mb-1 leading-snug">{item.title}</span>
                    <span className="text-[10px] text-[#0A84FF] font-extrabold mb-3 tracking-wide">{item.uploader || 'Creator'}</span>
                    
                    <span className="text-[11px] font-bold text-gray-400 mt-auto">{new Date(item.date).toLocaleDateString()}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-20 mb-6 text-center text-xs text-gray-400 font-medium relative z-10"
      >
        Made with precision • <span className="text-[#0A84FF]">StreamPure</span>
      </motion.footer>
    </div>
  );
}
