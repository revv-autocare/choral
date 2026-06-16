import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateSong } from '../../hooks/useSongs';
import { useToast } from '../../components/ui/Toast';
import { Button, Chip, ScreenHeader, Toggle } from '../../components/ui/primitives';
import { supabase } from '../../lib/supabase';

const KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Ab', 'Bb', 'Db', 'Eb', 'Gb'];
const TAGS = ['Slow', 'Mid', 'Fast', 'Worship', 'Praise', 'Hymn', 'English', 'Yoruba', 'Igbo'];

export default function AddSong() {
  const nav = useNavigate();
  const { show } = useToast();
  const createSong = useCreateSong();

  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [key, setKey] = useState('C');
  const [tempo, setTempo] = useState(90);
  const [tags, setTags] = useState<string[]>([]);
  const [lyrics, setLyrics] = useState('');
  const [coming, setComing] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  function toggleTag(t: string) {
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  }

  async function save() {
    if (!title.trim()) return;
    const song = await createSong.mutateAsync({ title, composer, song_key: key, tempo, tags, lyrics, coming });
    if (audioFile) {
      const path = `${song.id}/reference-${Date.now()}-${audioFile.name}`;
      const { error: upErr } = await supabase.storage.from('audio').upload(path, audioFile, { upsert: true });
      if (!upErr) await supabase.from('songs').update({ reference_audio_path: path }).eq('id', song.id);
    }
    show('Song saved');
    nav(`/songs/${song.id}`);
  }

  return (
    <div className="pb-10">
      <ScreenHeader title="Add Song" onBack={() => nav(-1)} />
      <div className="px-5 flex flex-col gap-4">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
        </Field>
        <Field label="Composer">
          <input value={composer} onChange={(e) => setComposer(e.target.value)} className="input" />
        </Field>

        <Field label="Key">
          <div className="flex gap-2 flex-wrap">
            {KEYS.map((k) => (
              <Chip key={k} active={key === k} onClick={() => setKey(k)}>{k}</Chip>
            ))}
          </div>
        </Field>

        <Field label={`Tempo -- ${tempo} bpm`}>
          <input type="range" min={40} max={200} value={tempo} onChange={(e) => setTempo(Number(e.target.value))} className="w-full" />
        </Field>

        <Field label="Tags">
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((t) => (
              <Chip key={t} active={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>
            ))}
          </div>
        </Field>

        <Field label="Reference audio">
          <label className="flex items-center justify-center gap-2 border border-dashed border-line2 rounded-xl px-4 py-5 text-sm font-medium text-ink2 cursor-pointer">
            {audioFile ? audioFile.name : 'Upload a recording'}
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)} />
          </label>
        </Field>

        <Field label="Lyrics">
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={6}
            placeholder="Type lyrics, or paste them after we auto-transcribe your audio -- you can correct them after."
            className="input resize-none"
          />
        </Field>

        <div className="flex items-center justify-between bg-surface border border-line rounded-2xl px-4 py-3.5">
          <div className="font-semibold text-sm">Coming up for rehearsal</div>
          <Toggle on={coming} onClick={() => setComing(!coming)} />
        </div>

        <Button onClick={save} disabled={createSong.isPending} className="mt-2">
          {createSong.isPending ? 'Saving...' : 'Save song'}
        </Button>
      </div>
      <style>{`.input{border:1px solid var(--color-line2);border-radius:12px;padding:13px 14px;font:500 14px 'DM Sans';background:var(--color-surface);width:100%;}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-semibold tracking-[.1em] uppercase text-ink3">{label}</span>
      {children}
    </label>
  );
}
