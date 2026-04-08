import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Settings, X, ListMusic, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Track {
  id: string;
  name: string;
}

const MusicPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const DEFAULT_API_KEY = 'AIzaSyBddDf9m1Bvzg5V_H3TYn6whHRpi3TxLjA';
  const DEFAULT_FOLDER_ID = '1hCgDh2IJmVhrd3JUER7JfB5NmQX6F6pD';

  const [apiKey, setApiKey] = useState(() => {
    const saved = localStorage.getItem('gdrive_api_key');
    if (saved === '.' || !saved || saved.length < 10) {
      localStorage.removeItem('gdrive_api_key');
      return DEFAULT_API_KEY;
    }
    return saved;
  });
  
  const [folderId, setFolderId] = useState(() => {
    const saved = localStorage.getItem('gdrive_folder_id');
    if (saved === '.' || !saved || saved.length < 10) {
      localStorage.removeItem('gdrive_folder_id');
      return DEFAULT_FOLDER_ID;
    }
    return saved;
  });

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (apiKey && folderId) {
      fetchTracks();
    }
  }, [apiKey, folderId]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const [debugLog, setDebugLog] = useState<string | null>(null);

  const fetchTracks = async () => {
    // FORCE USE THE PROVIDED CREDENTIALS
    const activeKey = 'AIzaSyBddDf9m1Bvzg5V_H3TYn6whHRpi3TxLjA';
    const activeFolder = '1hCgDh2IJmVhrd3JUER7JfB5NmQX6F6pD';

    setIsLoading(true);
    setError(null);
    setDebugLog(null);
    try {
      const q = encodeURIComponent(`'${activeFolder}' in parents and (mimeType contains 'audio/' or name contains '.mp3')`);
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${activeKey}&fields=files(id,name)&pageSize=100`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const message = data.error?.message || 'Failed to fetch tracks';
        setDebugLog(JSON.stringify(data, null, 2));
        throw new Error(`Google API Error: ${message}`);
      }

      setTracks(data.files || []);
      if (data.files?.length > 0 && currentTrackIndex === -1) {
        setCurrentTrackIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('B-PLAYER ERROR:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!audioRef.current || currentTrackIndex === -1) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => setError('Playback failed: ' + e.message));
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (index: number) => {
    const activeKey = 'AIzaSyBddDf9m1Bvzg5V_H3TYn6whHRpi3TxLjA';
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    
    if (audioRef.current) {
      audioRef.current.src = `https://www.googleapis.com/drive/v3/files/${tracks[index].id}?alt=media&key=${activeKey}`;
      audioRef.current.play().catch(e => setError('Playback failed: ' + e.message));
    }
  };

  const nextTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };

  const prevTrack = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (tracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(parseFloat(e.target.value));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('gdrive_api_key', apiKey);
    localStorage.setItem('gdrive_folder_id', folderId);
    setShowSettings(false);
    fetchTracks();
  };

  const currentTrack = tracks[currentTrackIndex];

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[10000]" />
      
      <motion.div 
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        initial={{ x: 20, y: 20 }}
        className={`fixed z-[10001] pointer-events-auto flex flex-col bg-matte-black/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ${
          isMinimized 
            ? 'w-16 h-16 rounded-full items-center justify-center' 
            : 'w-[320px] rounded-2xl'
        }`}
      >
        <audio 
          ref={audioRef} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => nextTrack()}
          crossOrigin="anonymous"
        />

        {isMinimized ? (
          <div className="relative w-full h-full flex items-center justify-center group">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/5"
              />
              <circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={188.5}
                strokeDashoffset={188.5 - (188.5 * progress) / 100}
                className="text-orange-accent transition-all duration-300"
              />
            </svg>
            <button 
              onClick={togglePlay}
              className="relative z-10 w-10 h-10 rounded-full bg-orange-accent flex items-center justify-center text-black hover:scale-110 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
            <button 
              onClick={() => setIsMinimized(false)}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-matte-gray border border-white/10 flex items-center justify-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <RefreshCw size={10} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header / Drag Handle */}
            <div className="p-3 flex items-center gap-3 border-b border-white/5 cursor-move">
              <div className="w-8 h-8 rounded-lg bg-orange-accent/10 flex items-center justify-center text-orange-accent shrink-0">
                <Music size={16} />
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-orange-accent truncate">B-Player</div>
                <div className="text-[9px] text-gray-400 truncate">
                  {currentTrack ? currentTrack.name.replace(/\.[^/.]+$/, "") : "Ready to play"}
                </div>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <button onClick={prevTrack} className="p-2 text-gray-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
                <button 
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-orange-accent flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-accent/20"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={nextTrack} className="p-2 text-gray-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
                
                <div className="ml-auto flex items-center gap-2">
                  <Volume2 size={14} className="text-gray-500" />
                  <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-white/10 rounded-full appearance-none accent-orange-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-mono text-gray-500">
                  <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}</span>
                  <span>{audioRef.current ? formatTime(audioRef.current.duration) : "0:00"}</span>
                </div>
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden group cursor-pointer">
                  <div 
                    className="absolute inset-0 bg-orange-accent transition-all duration-300" 
                    style={{ width: `${progress}%` }} 
                  />
                  <input 
                    type="range"
                    min="0" max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Playlist Toggle */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 transition-colors text-[9px] font-black uppercase tracking-widest text-gray-400"
            >
              <ListMusic size={14} />
              {isOpen ? "Hide Playlist" : "Show Playlist"}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 240 }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-black/20"
                >
                  <div className="p-2 h-full flex flex-col">
                    <div className="flex items-center justify-between px-2 py-1 mb-2">
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-tighter">Tracks ({tracks.length})</span>
                      <button onClick={() => setShowSettings(!showSettings)} className="p-1 text-gray-600 hover:text-orange-accent">
                        <Settings size={12} />
                      </button>
                    </div>

                    {showSettings ? (
                      <div className="p-2 space-y-2 animate-in fade-in duration-200">
                        <input 
                          type="password" 
                          value={apiKey} 
                          onChange={(e) => setApiKey(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-orange-accent"
                          placeholder="API Key..."
                        />
                        <input 
                          type="text" 
                          value={folderId} 
                          onChange={(e) => setFolderId(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded p-2 text-[10px] text-white outline-none focus:border-orange-accent"
                          placeholder="Folder ID..."
                        />
                        <div className="flex gap-2">
                          <button onClick={saveSettings} className="flex-grow py-2 bg-orange-accent text-black text-[10px] font-black uppercase rounded">Apply</button>
                          <button onClick={() => setShowSettings(false)} className="px-4 py-2 bg-white/5 text-gray-400 text-[10px] font-black uppercase rounded">Back</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow overflow-y-auto custom-scrollbar space-y-0.5">
                        {tracks.map((track, idx) => (
                          <button
                            key={track.id}
                            onClick={() => playTrack(idx)}
                            className={`w-full text-left px-3 py-2 rounded text-[10px] truncate transition-colors ${idx === currentTrackIndex ? 'bg-orange-accent/20 text-orange-accent font-bold' : 'hover:bg-white/5 text-gray-500'}`}
                          >
                            {idx + 1}. {track.name.replace(/\.[^/.]+$/, "")}
                          </button>
                        ))}
                        {tracks.length === 0 && !isLoading && (
                          <div className="text-center py-10 text-[10px] text-gray-600 italic">No tracks found</div>
                        )}
                        {isLoading && (
                          <div className="text-center py-10">
                            <RefreshCw size={16} className="animate-spin text-orange-accent mx-auto" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </>
  );
};

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default MusicPlayer;
