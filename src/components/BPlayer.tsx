import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Settings as SettingsIcon, Volume2, VolumeX, Maximize, 
  Music, Film, Loader2, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, PlayerState, PlayerSettings } from '../types';

export default function BPlayer() {
  const [settings, setSettings] = useState<PlayerSettings>(() => {
    const saved = localStorage.getItem('bplayer_settings');
    return saved ? JSON.parse(saved) : { apiKey: '', folderId: '' };
  });
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTrack = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    if (settings.apiKey && settings.folderId) {
      fetchTracks();
    }
  }, [settings]);

  const fetchTracks = async () => {
    setPlayerState('loading');
    setError(null);
    try {
      const q = encodeURIComponent(
        `'${settings.folderId}' in parents and (mimeType contains 'audio/' or mimeType contains 'video/' or name contains '.mp3' or name contains '.mp4' or name contains '.webm')`
      );
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${settings.apiKey}&fields=files(id,name,mimeType)`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch tracks. Check API Key and Folder ID.');
      
      const data = await response.json();
      const mappedTracks: Track[] = data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        type: file.mimeType.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm') ? 'video' : 'audio'
      }));
      
      setTracks(mappedTracks);
      if (mappedTracks.length > 0) {
        setCurrentTrackIndex(0);
        setPlayerState('paused');
      } else {
        setPlayerState('idle');
      }
    } catch (err: any) {
      setError(err.message);
      setPlayerState('error');
    }
  };

  const togglePlay = () => {
    if (playerState === 'idle' || playerState === 'loading') return;
    
    const media = currentTrack?.type === 'video' ? videoRef.current : audioRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play().catch(e => console.error("Playback failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const media = e.currentTarget;
    setProgress(media.currentTime);
    setDuration(media.duration || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    const media = currentTrack?.type === 'video' ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = time;
      setProgress(time);
    }
  };

  const handleTrackEnd = () => {
    if (isRepeat) {
      const media = currentTrack?.type === 'video' ? videoRef.current : audioRef.current;
      if (media) {
        media.currentTime = 0;
        media.play();
      }
    } else {
      nextTrack();
    }
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const saveSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newSettings = {
      apiKey: formData.get('apiKey') as string,
      folderId: formData.get('folderId') as string,
    };
    setSettings(newSettings);
    localStorage.setItem('bplayer_settings', JSON.stringify(newSettings));
    setShowSettings(false);
  };

  const getMediaUrl = (id: string) => {
    return `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${settings.apiKey}`;
  };

  return (
    <section id="player" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div ref={containerRef} className="glass overflow-hidden relative flex flex-col min-h-[400px]">
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,107,0,0.5)]">
                <Music className="text-white w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold tracking-tight">B-PLAYER</h3>
                <p className="text-xs text-text-secondary uppercase tracking-widest">Premium Sound</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Visualizer / Video Area */}
            <div className="flex-1 bg-black/40 relative aspect-video md:aspect-auto flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {playerState === 'loading' ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <Loader2 className="w-12 h-12 text-accent animate-spin" />
                    <p className="text-text-secondary font-mono text-sm">LOADING ASSETS...</p>
                  </motion.div>
                ) : playerState === 'idle' ? (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center p-8"
                  >
                    <p className="text-text-secondary mb-4">No tracks found. Please configure settings.</p>
                    <button onClick={() => setShowSettings(true)} className="btn-accent py-2 px-6">Open Settings</button>
                  </motion.div>
                ) : currentTrack?.type === 'video' ? (
                  <video
                    key={currentTrack.id}
                    ref={videoRef}
                    src={getMediaUrl(currentTrack.id)}
                    className="w-full h-full object-contain"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleTrackEnd}
                    autoPlay={isPlaying}
                    playsInline
                  />
                ) : (
                  <motion.div 
                    key="audio-visual"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center gap-8 w-full h-full p-12"
                  >
                    <div className="relative">
                      <motion.div 
                        animate={isPlaying ? { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-accent rounded-full blur-3xl"
                      />
                      <div className="w-48 h-48 rounded-2xl glass flex items-center justify-center relative z-10 border-white/20">
                        <Music className="w-24 h-24 text-accent" />
                      </div>
                    </div>
                    <div className="text-center z-10">
                      <h4 className="text-xl font-bold mb-1">{currentTrack?.name}</h4>
                      <p className="text-text-secondary uppercase text-xs tracking-widest">Benito Eugenio</p>
                    </div>
                    <audio
                      ref={audioRef}
                      src={currentTrack ? getMediaUrl(currentTrack.id) : ''}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleTrackEnd}
                      autoPlay={isPlaying}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Playlist Sidebar (Desktop) / Collapsible (Mobile) */}
            <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 flex flex-col ${isExpanded ? 'h-auto' : 'h-0 md:h-auto overflow-hidden'}`}>
              <div className="p-4 bg-white/5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">Playlist</span>
                <span className="text-[10px] font-mono bg-accent/20 text-accent px-2 py-0.5 rounded">{tracks.length} ITEMS</span>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[300px] md:max-h-none">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(index);
                      setIsPlaying(true);
                    }}
                    className={`w-full p-4 flex items-center gap-3 transition-colors hover:bg-white/5 text-left border-b border-white/5 ${currentTrackIndex === index ? 'bg-accent/10 border-l-4 border-l-accent' : ''}`}
                  >
                    {track.type === 'video' ? <Film className="w-4 h-4 text-text-secondary" /> : <Music className="w-4 h-4 text-text-secondary" />}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${currentTrackIndex === index ? 'text-accent font-bold' : 'text-text-primary'}`}>{track.name}</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-tighter">{track.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="p-6 bg-black/60 backdrop-blur-md border-t border-white/10">
            {/* Progress */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[10px] font-mono text-text-secondary w-10">{formatTime(progress)}</span>
              <input 
                type="range" 
                min="0" max={duration || 0} step="0.1"
                value={progress}
                onChange={handleSeek}
                className="flex-1 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-text-secondary w-10">{formatTime(duration)}</span>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Playback Controls */}
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-2 transition-colors ${isShuffle ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button onClick={prevTrack} className="p-2 text-text-secondary hover:text-white transition-colors">
                  <SkipBack className="w-6 h-6 fill-current" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-14 h-14 bg-accent rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,107,0,0.4)]"
                >
                  {isPlaying ? <Pause className="w-6 h-6 text-white fill-current" /> : <Play className="w-6 h-6 text-white fill-current ml-1" />}
                </button>
                <button onClick={nextTrack} className="p-2 text-text-secondary hover:text-white transition-colors">
                  <SkipForward className="w-6 h-6 fill-current" />
                </button>
                <button 
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`p-2 transition-colors ${isRepeat ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Volume & Misc */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-center">
                <div className="flex items-center gap-3 group">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-text-secondary hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input 
                    type="range" min="0" max="1" step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 accent-accent h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                {currentTrack?.type === 'video' && (
                  <button onClick={handleFullscreen} className="text-text-secondary hover:text-white transition-colors">
                    <Maximize className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="md:hidden text-text-secondary hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass w-full max-w-md p-8 relative z-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Player Settings</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={saveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Google Drive API Key</label>
                  <input 
                    name="apiKey" 
                    type="password"
                    defaultValue={settings.apiKey}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter your API Key"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Folder ID</label>
                  <input 
                    name="folderId" 
                    type="text"
                    defaultValue={settings.folderId}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-accent transition-colors"
                    placeholder="Enter Google Drive Folder ID"
                  />
                </div>
                <button type="submit" className="btn-accent w-full">Save & Reload</button>
              </form>
              <p className="mt-6 text-[10px] text-text-secondary text-center leading-relaxed">
                Your credentials are saved locally in your browser. <br/>
                Make sure the folder has "Anyone with the link" access.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
