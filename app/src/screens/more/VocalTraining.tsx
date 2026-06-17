import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocalTrainings, useMyCompletedTrainings, useMarkTrainingComplete, useCreateTraining } from '../../hooks/useTrainings';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card, Chip, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/Toast';

const CATEGORY_LABEL: Record<string, string> = {
  breathing: 'Breathing',
  warm_up: 'Warm-up',
  pitch_ear: 'Pitch & ear',
  harmony: 'Harmony',
};
const CATEGORIES = Object.keys(CATEGORY_LABEL);

export default function VocalTraining() {
  const nav = useNavigate();
  const { show } = useToast();
  const { isLeadOrAbove } = usePermissions();
  const { data: trainings } = useVocalTrainings();
  const { data: completed } = useMyCompletedTrainings();
  const markDone = useMarkTrainingComplete();
  const create = useCreateTraining();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('breathing');
  const [url, setUrl] = useState('');

  const builtin = (trainings ?? []).filter((t) => t.is_builtin);
  const custom = (trainings ?? []).filter((t) => !t.is_builtin);

  async function save() {
    if (!title.trim()) {
      show('Training title required');
      return;
    }
    await create.mutateAsync({ title: title.trim(), category, video_url: url.trim() || null });
    setTitle('');
    setCategory('breathing');
    setUrl('');
    setOpen(false);
    show('Training added');
  }

  const row = (t: { id: string; title: string; category: string }) => {
    const done = completed?.has(t.id);
    return (
      <Card key={t.id} className="p-3.5 flex items-center justify-between">
        <div>
          <div className="font-semibold text-sm">{t.title}</div>
          <div className="text-xs text-ink3 mt-0.5">{CATEGORY_LABEL[t.category] ?? t.category}</div>
        </div>
        <button
          onClick={() => markDone.mutate(t.id)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: done ? '#E7F0E8' : '#ECEAF8', color: done ? '#3E7C53' : '#3F3795' }}
        >
          {done ? 'Completed' : 'Mark done'}
        </button>
      </Card>
    );
  };

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Vocal training"
        onBack={() => nav(-1)}
        right={
          isLeadOrAbove && (
            <button onClick={() => setOpen(true)} className="text-xs font-semibold text-indigo">
              + New
            </button>
          )
        }
      />
      <div className="px-5">
        <SectionTitle>Built-in exercises</SectionTitle>
        <div className="flex flex-col gap-2.5">
          {builtin.map(row)}
          {!builtin.length && <div className="text-sm text-ink3">No exercises yet.</div>}
        </div>

        {!!custom.length && (
          <>
            <SectionTitle>From your director</SectionTitle>
            <div className="flex flex-col gap-2.5">{custom.map(row)}</div>
          </>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="New training">
        <div className="flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </div>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Video link (optional)" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <Button onClick={save}>Add training</Button>
        </div>
      </Sheet>
    </div>
  );
}
