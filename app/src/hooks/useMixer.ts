import { useCallback, useEffect, useRef, useState } from 'react';

export interface MixerPart {
  id: string;
  name: string;
  audioUrl: string | null;
}

const NOTE_FREQ: Record<string, number> = {
  C: 261.63, 'C#': 277.18, Db: 277.18, D: 293.66, 'D#': 311.13, Eb: 311.13,
  E: 329.63, F: 349.23, 'F#': 369.99, Gb: 369.99, G: 392.0, 'G#': 415.3,
  Ab: 415.3, A: 440.0, 'A#': 466.16, Bb: 466.16, B: 493.88,
};

// Frequency ratios used only as a fallback drone when a part has no uploaded
// stem yet, so the mixer still demonstrates something audible per voice.
const FALLBACK_RATIO: Record<string, number> = { Soprano: 2, Alto: 1.5, Tenor: 1.25, Bass: 1 };

interface PartNode {
  source: AudioBufferSourceNode | OscillatorNode;
  overtone?: OscillatorNode;
  gain: GainNode;
}

export function useMixer(parts: MixerPart[], baseKey: string = 'C') {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const nodesRef = useRef<Map<string, PartNode>>(new Map());
  const [playing, setPlaying] = useState(false);
  const [mix, setMixState] = useState<Record<string, number>>(() =>
    Object.fromEntries(parts.map((p) => [p.id, 80]))
  );
  const [solo, setSolo] = useState<Set<string>>(new Set());
  const [muted, setMuted] = useState<Set<string>>(new Set());

  function ensureCtx(): AudioContext {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      const ctx = ensureCtx();
      for (const p of parts) {
        if (!p.audioUrl || buffersRef.current.has(p.id)) continue;
        try {
          const res = await fetch(p.audioUrl);
          const arr = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(arr);
          if (!cancelled) buffersRef.current.set(p.id, buf);
        } catch {
          // leave unset -- falls back to synth drone
        }
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts.map((p) => p.audioUrl).join('|')]);

  const audibleGain = useCallback(
    (partId: string) => {
      const isSoloing = solo.size > 0;
      if (isSoloing && !solo.has(partId)) return 0;
      if (muted.has(partId)) return 0;
      return (mix[partId] ?? 0) / 100;
    },
    [mix, solo, muted]
  );

  function stopAll() {
    nodesRef.current.forEach((n) => {
      try {
        n.source.stop();
        n.overtone?.stop();
      } catch {
        /* already stopped */
      }
    });
    nodesRef.current.clear();
  }

  function startPlayback() {
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    stopAll();
    const baseFreq = NOTE_FREQ[baseKey] ?? 261.63;

    for (const p of parts) {
      const gain = ctx.createGain();
      gain.gain.value = audibleGain(p.id);
      gain.connect(ctx.destination);

      const buf = buffersRef.current.get(p.id);
      if (buf) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.connect(gain);
        src.start();
        nodesRef.current.set(p.id, { source: src, gain });
      } else {
        const ratio = FALLBACK_RATIO[p.name] ?? 1;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = baseFreq * ratio;
        osc.connect(gain);
        osc.start();

        const overtone = ctx.createOscillator();
        overtone.type = 'triangle';
        overtone.frequency.value = baseFreq * ratio * 2;
        const overtoneGain = ctx.createGain();
        overtoneGain.gain.value = 0.15;
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        overtone.start();

        nodesRef.current.set(p.id, { source: osc, overtone, gain });
      }
    }
    setPlaying(true);
  }

  function applyGains() {
    nodesRef.current.forEach((n, partId) => {
      n.gain.gain.value = audibleGain(partId);
    });
  }

  useEffect(() => {
    applyGains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mix, solo, muted]);

  function togglePlay() {
    if (playing) {
      stopAll();
      setPlaying(false);
    } else {
      startPlayback();
    }
  }

  function setMix(partId: string, value: number) {
    setMixState((m) => ({ ...m, [partId]: value }));
  }

  function toggleSolo(partId: string) {
    setSolo((s) => {
      const next = new Set(s);
      next.has(partId) ? next.delete(partId) : next.add(partId);
      return next;
    });
  }

  function toggleMute(partId: string) {
    setMuted((s) => {
      const next = new Set(s);
      next.has(partId) ? next.delete(partId) : next.add(partId);
      return next;
    });
  }

  function pitchPipe(key: string) {
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const freq = NOTE_FREQ[key] ?? 261.63;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 1.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.8);
  }

  useEffect(() => () => stopAll(), []);

  return { playing, togglePlay, mix, setMix, solo, toggleSolo, muted, toggleMute, pitchPipe };
}
