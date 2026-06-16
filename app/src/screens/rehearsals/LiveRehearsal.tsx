import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgenda, useRehearsal } from '../../hooks/useRehearsals';
import { useMembers } from '../../hooks/useMembers';
import { useLiveTimer, formatCountdown } from '../../hooks/useLiveTimer';

export default function LiveRehearsal() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: rehearsal } = useRehearsal(id);
  const { data: agenda } = useAgenda(id);
  const { data: members } = useMembers();

  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);

  const items = agenda ?? [];
  const current = items[index];
  const next = items[index + 1];

  const remaining = useLiveTimer(current?.minutes ? current.minutes * 60 : 0, running && !!current);
  const overrun = remaining < 0;
  const pct = current ? Math.min(100, Math.max(0, 100 - (remaining / (current.minutes * 60)) * 100)) : 0;

  useEffect(() => {
    setRunning(true);
  }, [index]);

  function ownerName(ownerId: string | null) {
    return members?.find((m) => m.id === ownerId)?.name ?? 'Unassigned';
  }

  function goNext() {
    if (index < items.length - 1) setIndex(index + 1);
  }
  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  if (!rehearsal || !current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-6 text-center gap-4">
        <div className="font-serif text-xl font-semibold">No agenda items</div>
        <button onClick={() => nav(-1)} className="text-sm text-white/60">Go back</button>
      </div>
    );
  }

  const ring = `conic-gradient(${overrun ? '#BE463C' : '#D9B25E'} ${pct}%, rgba(255,255,255,0.12) ${pct}%)`;

  return (
    <div className="min-h-screen flex flex-col text-white px-6 pt-6 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="text-xs font-semibold uppercase tracking-[.14em] text-white/50">
          {index + 1} of {items.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-56 h-56 rounded-full flex items-center justify-center" style={{ background: ring }}>
          <div className="w-44 h-44 rounded-full bg-dark flex flex-col items-center justify-center">
            <div className={`font-mono text-4xl font-semibold ${overrun ? 'text-[#E0726A]' : 'text-white'}`}>
              {formatCountdown(remaining)}
            </div>
            <div className="text-xs text-white/50 mt-1">{overrun ? 'overrun' : 'remaining'}</div>
          </div>
        </div>

        <div className="text-center mt-8">
          <div className="font-serif text-2xl font-semibold">{current.name}</div>
          <div className="text-sm text-white/60 mt-1.5">Led by {ownerName(current.owner_id)} &middot; {current.minutes} min</div>
        </div>

        <button
          onClick={() => setRunning((r) => !r)}
          className="mt-6 w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
        >
          {running ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l15 8-15 8z" /></svg>
          )}
        </button>

        {next && (
          <div className="mt-8 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/40">Up next</div>
            <div className="text-sm font-semibold mt-1">{next.name}</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex-1 py-3 rounded-xl bg-white/10 text-sm font-semibold disabled:opacity-30"
        >
          Previous
        </button>
        {index < items.length - 1 ? (
          <button onClick={goNext} className="flex-1 py-3 rounded-xl bg-gold text-dark text-sm font-semibold">
            Next item
          </button>
        ) : (
          <button onClick={() => nav(`/rehearsals/${id}`)} className="flex-1 py-3 rounded-xl bg-gold text-dark text-sm font-semibold">
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
