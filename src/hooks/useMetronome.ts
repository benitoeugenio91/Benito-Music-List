import { useEffect, useRef } from 'react';

export function useMetronome(bpm: number, beats: number, subdivisions: number, enabled: boolean) {
  const audioContext = useRef<AudioContext | null>(null);
  const nextTickTime = useRef<number>(0);
  const currentSubdivision = useRef<number>(0);
  const timerId = useRef<number | null>(null);

  useEffect(() => {
    if (enabled) {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume();
      }

      nextTickTime.current = audioContext.current.currentTime + 0.1;
      currentSubdivision.current = 0;
      
      const scheduler = () => {
        while (nextTickTime.current < audioContext.current!.currentTime + 0.1) {
          playTick(nextTickTime.current, currentSubdivision.current);
          
          const secondsPerBeat = 60.0 / bpm;
          const secondsPerSubdivision = secondsPerBeat / subdivisions;
          
          nextTickTime.current += secondsPerSubdivision;
          currentSubdivision.current = (currentSubdivision.current + 1) % (beats * subdivisions);
        }
        timerId.current = window.setTimeout(scheduler, 25);
      };

      scheduler();
    } else {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    }

    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };
  }, [enabled, bpm, beats, subdivisions]);

  const playTick = (time: number, subdivision: number) => {
    if (!audioContext.current) return;

    const osc = audioContext.current.createOscillator();
    const envelope = audioContext.current.createGain();

    // Accent on the first beat of the measure
    const isFirstBeat = subdivision === 0;
    // Accent on every beat
    const isBeat = subdivision % subdivisions === 0;

    osc.frequency.value = isFirstBeat ? 1000 : (isBeat ? 800 : 400);
    
    envelope.gain.value = isBeat ? 0.3 : 0.1;
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(envelope);
    envelope.connect(audioContext.current.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  };
}
