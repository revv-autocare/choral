import { useEffect, useRef, useState } from 'react';

// Timestamp-based countdown so it stays accurate even if the tab is
// backgrounded and setInterval ticks get throttled.
export function useLiveTimer(durationSec: number, running: boolean) {
  const [remaining, setRemaining] = useState(durationSec);
  const deadlineRef = useRef(Date.now() + durationSec * 1000);
  const pausedRemainingRef = useRef(durationSec);

  useEffect(() => {
    deadlineRef.current = Date.now() + durationSec * 1000;
    pausedRemainingRef.current = durationSec;
    setRemaining(durationSec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSec]);

  useEffect(() => {
    if (!running) {
      pausedRemainingRef.current = remaining;
      return;
    }
    deadlineRef.current = Date.now() + pausedRemainingRef.current * 1000;
    const id = setInterval(() => {
      const left = Math.round((deadlineRef.current - Date.now()) / 1000);
      setRemaining(left);
    }, 250);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return remaining;
}

export function formatCountdown(sec: number): string {
  const over = sec < 0;
  const abs = Math.abs(sec);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${over ? '+' : ''}${m}:${String(s).padStart(2, '0')}`;
}
