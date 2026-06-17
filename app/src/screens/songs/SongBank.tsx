import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongs } from '../../hooks/useSongs';
import { usePermissions } from '../../hooks/usePermissions';
import { Chip } from '../../components/ui/primitives';

const FILTERS = ['Slow', 'Mid', 'Fast', 'Worship', 'Praise', 'Hymn'];

export default function SongBank() {
  const nav = useNavigate();
  const { data: songs } = useSongs();
  const { can } = usePermissions();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (songs ?? []).filter((s) => {
      if (active && !s.tags.includes(active)) return false;
      if (query && !s.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [songs, active, query]);

  const coming = filtered.filter((s) => s.coming);
  const rest = filtered.filter((s) => !s.coming);

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between">
        <div className="font-serif font-semibold text-2xl">Song Bank</div>
        {can('add_song') && (
          <button onClick={() => nav('/songs/new')} className="w-9 h-9 rounded-full bg-indigo text-white flex items-center justify-center text-xl font-semibold">
            +
          </button>
        )}
      </div>

      <input
        placeholder="Search songs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mt-4 border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface"
      />

      <div className="flex gap-2 overflow-x-auto mt-3 pb-1 -mx-5 px-5">
        <Chip active={active === null} onClick={() => setActive(null)}>All</Chip>
        {FILTERS.map((f) => (
          <Chip key={f} active={active === f} onClick={() => setActive(active === f ? null : f)}>
            {f}
          </Chip>
        ))}
      </div>

      {!!coming.length && (
        <>
          <div className="font-semibold text-base mt-6 mb-3">Coming up for rehearsal</div>
          <div className="flex flex-col gap-2.5">
            {coming.map((s) => (
              <SongRow key={s.id} song={s} onClick={() => nav(`/songs/${s.id}`)} />
            ))}
          </div>
        </>
      )}

      <div className="font-semibold text-base mt-6 mb-3">All songs</div>
      <div className="flex flex-col gap-2.5 pb-6">
        {rest.map((s) => (
          <SongRow key={s.id} song={s} onClick={() => nav(`/songs/${s.id}`)} />
        ))}
        {!filtered.length && <div className="text-sm text-ink3 py-6 text-center">No songs match.</div>}
      </div>
    </div>
  );
}

function SongRow({ song, onClick }: { song: { title: string; composer: string | null; song_key: string | null; tempo: number | null; tags: string[] }; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 bg-surface border border-line rounded-2xl px-4 py-3.5 text-left">
      <div className="font-mono text-[11px] px-2 py-1 rounded-md bg-indigo-soft text-indigo-d shrink-0">{song.song_key}</div>
      <div className="flex-1">
        <div className="font-serif font-semibold text-[15px]">{song.title}</div>
        <div className="text-[11px] text-ink3 mt-0.5">{song.composer} &middot; {song.tempo} bpm</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9183" strokeWidth="1.8"><path d="M6 4l8 8-8 8" /></svg>
    </button>
  );
}
