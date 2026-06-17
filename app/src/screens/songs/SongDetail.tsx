import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSong, useSongParts, useAddSongPart, useUploadPartAudio, useSignedAudioUrls } from '../../hooks/useSongs';
import { useMixer } from '../../hooks/useMixer';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../components/ui/Toast';
import { Button, Card, ScreenHeader } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { cacheAudioForOffline } from '../../lib/offlineCache';

export default function SongDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();
  const { can } = usePermissions();
  const { data: song } = useSong(id);
  const { data: parts } = useSongParts(id);
  const addPart = useAddSongPart(id ?? '');
  const uploadPartAudio = useUploadPartAudio(id ?? '');

  const partPaths = useMemo(() => (parts ?? []).map((p) => p.audio_path), [parts]);
  const { data: urlMap } = useSignedAudioUrls(partPaths);

  const mixerParts = useMemo(
    () => (parts ?? []).map((p) => ({ id: p.id, name: p.name, audioUrl: p.audio_path ? urlMap?.[p.audio_path] ?? null : null })),
    [parts, urlMap]
  );
  const mixer = useMixer(mixerParts, song?.song_key ?? 'C');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [partName, setPartName] = useState('');
  const [partNotes, setPartNotes] = useState('');
  const lyricsRef = useRef<HTMLDivElement>(null);

  if (!song) return <div className="px-5 pt-10 text-ink3 text-sm">Loading...</div>;

  async function savePart() {
    if (!partName.trim()) return;
    await addPart.mutateAsync({ name: partName, notes: partNotes });
    setPartName('');
    setPartNotes('');
    setSheetOpen(false);
    show('Part added');
  }

  async function downloadForOffline() {
    const urls = Object.values(urlMap ?? {});
    await cacheAudioForOffline(urls);
    show('Cached for offline practice');
  }

  return (
    <div className="pb-10">
      <ScreenHeader title={song.title} onBack={() => nav(-1)} />
      <div className="px-5 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1.5 rounded-md bg-indigo-soft text-indigo-d font-semibold">{song.song_key}</span>
          <span className="text-xs font-medium text-ink3">{song.tempo} bpm</span>
          <button
            onClick={() => song.song_key && mixer.pitchPipe(song.song_key)}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-indigo px-3 py-1.5 rounded-full border border-indigo-soft bg-indigo-soft"
          >
            Pitch pipe
          </button>
        </div>
        <div className="text-sm text-ink2">{song.composer}</div>

        {!!mixerParts.length && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Sing-along mixer</div>
              <button
                onClick={mixer.togglePlay}
                className="w-10 h-10 rounded-full bg-indigo flex items-center justify-center text-white"
              >
                {mixer.playing ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><rect x="5" y="4" width="5" height="16" /><rect x="14" y="4" width="5" height="16" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M6 4l15 8-15 8z" /></svg>
                )}
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {mixerParts.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-16 text-xs font-semibold">{p.name}</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={mixer.mix[p.id] ?? 0}
                    onChange={(e) => mixer.setMix(p.id, Number(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => mixer.toggleSolo(p.id)}
                    className="text-[10px] font-bold w-7 h-7 rounded-full border"
                    style={{
                      background: mixer.solo.has(p.id) ? '#B0843A' : 'transparent',
                      color: mixer.solo.has(p.id) ? '#fff' : '#9A9183',
                      borderColor: mixer.solo.has(p.id) ? '#B0843A' : '#DED5C2',
                    }}
                  >
                    S
                  </button>
                  <button
                    onClick={() => mixer.toggleMute(p.id)}
                    className="text-[10px] font-bold w-7 h-7 rounded-full border"
                    style={{
                      background: mixer.muted.has(p.id) ? '#BE463C' : 'transparent',
                      color: mixer.muted.has(p.id) ? '#fff' : '#9A9183',
                      borderColor: mixer.muted.has(p.id) ? '#BE463C' : '#DED5C2',
                    }}
                  >
                    M
                  </button>
                </div>
              ))}
            </div>
            <button onClick={downloadForOffline} className="mt-3 text-xs font-semibold text-indigo">
              Download for offline practice
            </button>
          </Card>
        )}

        <div>
          <div className="font-semibold text-sm mb-2">Lyrics</div>
          <div
            ref={lyricsRef}
            className="bg-dark text-white/90 rounded-2xl p-5 max-h-72 overflow-y-auto whitespace-pre-line font-serif text-lg leading-relaxed"
          >
            {song.lyrics || 'No lyrics yet.'}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-sm">Parts &amp; vocal guides</div>
            {can('manage_parts') && (
              <button onClick={() => setSheetOpen(true)} className="text-xs font-semibold text-indigo">
                Add part
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {(parts ?? []).map((p) => (
              <Card key={p.id} className="p-3.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{p.name}</div>
                  {can('manage_parts') && (
                    <label className="text-xs font-semibold text-indigo cursor-pointer">
                      {p.audio_path ? 'Replace guide' : 'Upload guide'}
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadPartAudio.mutate({ partId: p.id, file: f });
                        }}
                      />
                    </label>
                  )}
                </div>
                {p.notes && <div className="text-xs text-ink2 mt-1.5">{p.notes}</div>}
              </Card>
            ))}
            {!parts?.length && <div className="text-xs text-ink3">No parts yet.</div>}
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Add part">
        <div className="flex flex-col gap-3">
          <input value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="Part name (e.g. Soprano)" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <textarea value={partNotes} onChange={(e) => setPartNotes(e.target.value)} placeholder="Direction from the lead" rows={3} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface resize-none" />
          <Button onClick={savePart}>Save part</Button>
        </div>
      </Sheet>
    </div>
  );
}
