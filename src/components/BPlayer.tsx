import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Settings as SettingsIcon, Volume2, VolumeX, Maximize, 
  Music, Film, Loader2, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, PlayerState, PlayerSettings } from '../types';

export default function BPlayer() {
  const [settings] = useState<PlayerSettings>({ 
    apiKey: 'AIzaSyBUMRmDoIhKrS_UQ-MlZD7CqQHnwNrS8bE', 
    folderId: '1SurtCygYcHkMfWEzw_S884TFJyZVU9wm' 
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
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentTrack = currentTrackIndex >= 0 ? tracks[currentTrackIndex] : null;

  useEffect(() => {
    fetchTracks();
  }, []);

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
    <div className="flex flex-col h-full bg-black/20">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Visualizer / Video Area */}
        <div className="flex-1 bg-black/40 relative aspect-video lg:aspect-auto flex items-center justify-center overflow-hidden min-h-[300px]">
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
                <p className="text-text-secondary mb-4">No tracks found.</p>
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
                className="flex flex-col items-center justify-center gap-8 w-full h-full p-8"
              >
                <div className="relative">
                  <motion.div 
                    animate={isPlaying ? { scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] } : {}}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="absolute inset-0 bg-accent rounded-full blur-[100px]"
                  />
                  <div className="w-40 h-40 md:w-64 md:h-64 rounded-3xl glass flex items-center justify-center relative z-10 border-white/20 shadow-2xl">
                    <Music className="w-20 h-20 md:w-32 md:h-32 text-accent" />
                  </div>
                </div>
                <div className="text-center z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-2 tracking-tight">{currentTrack?.name}</h4>
                  <p className="text-accent uppercase text-xs font-bold tracking-[0.3em]">Benito Eugenio</p>
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

        {/* Playlist Sidebar */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col bg-black/40">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">Tracklist</span>
            <span className="text-[10px] font-mono bg-accent text-white px-2 py-0.5 rounded-full">{tracks.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px] lg:max-h-none">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(index);
                  setIsPlaying(true);
                }}
                className={`w-full p-5 flex items-center gap-4 transition-all hover:bg-white/5 text-left border-b border-white/5 group ${currentTrackIndex === index ? 'bg-accent/10' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${currentTrackIndex === index ? 'bg-accent text-white' : 'bg-white/5 text-text-secondary group-hover:bg-white/10'}`}>
                  {track.type === 'video' ? <Film className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate font-bold ${currentTrackIndex === index ? 'text-accent' : 'text-text-primary'}`}>{track.name}</p>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-1">{track.type}</p>
                </div>
                {currentTrackIndex === index && isPlaying && (
                  <div className="flex gap-0.5 items-end h-3">
                    {[1, 2, 3].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        className="w-0.5 bg-accent"
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-8 bg-black/80 backdrop-blur-2xl border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-6 mb-8">
            <span className="text-[10px] font-mono text-text-secondary w-12 text-right">{formatTime(progress)}</span>
            <div className="flex-1 relative h-1.5 group cursor-pointer">
              <div className="absolute inset-0 bg-white/10 rounded-full" />
              <motion.div 
                className="absolute inset-y-0 left-0 bg-accent rounded-full"
                style={{ width: `${(progress / (duration || 1)) * 100}%` }}
              />
              <input 
                type="range" 
                min="0" max={duration || 0} step="0.1"
                value={progress}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
            <span className="text-[10px] font-mono text-text-secondary w-12">{formatTime(duration)}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Track Info (Mobile/Tablet) */}
            <div className="hidden md:flex items-center gap-4 w-1/3">
              <div className="w-12 h-12 rounded-xl glass flex items-center justify-center border-white/10">
                {currentTrack?.type === 'video' ? <Film className="w-5 h-5 text-accent" /> : <Music className="w-5 h-5 text-accent" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{currentTrack?.name || 'No Track Selected'}</p>
                <p className="text-[10px] text-accent uppercase tracking-widest font-bold">Benito Eugenio</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`transition-colors ${isShuffle ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button onClick={prevTrack} className="text-text-secondary hover:text-white transition-all hover:scale-110">
                <SkipBack className="w-8 h-8 fill-current" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-accent rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,107,0,0.5)]"
              >
                {isPlaying ? <Pause className="w-8 h-8 text-white fill-current" /> : <Play className="w-8 h-8 text-white fill-current ml-1" />}
              </button>
              <button onClick={nextTrack} className="text-text-secondary hover:text-white transition-all hover:scale-110">
                <SkipForward className="w-8 h-8 fill-current" />
              </button>
              <button 
                onClick={() => setIsRepeat(!isRepeat)}
                className={`transition-colors ${isRepeat ? 'text-accent' : 'text-text-secondary hover:text-white'}`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume & Misc */}
            <div className="flex items-center gap-6 w-full md:w-1/3 justify-center md:justify-end">
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
                <button onClick={handleFullscreen} className="text-text-secondary hover:text-white transition-colors hover:scale-110">
                  <Maximize className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
