import { useNavigate } from 'react-router-dom';
import { useVocalTrainings, useMyCompletedTrainings, useMarkTrainingComplete } from '../../hooks/useTrainings';
import { Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';

const CATEGORY_LABEL: Record<string, string> = {
  breathing: 'Breathing',
  warm_up: 'Warm-up',
  pitch_ear: 'Pitch & ear',
  harmony: 'Harmony',
};

export default function VocalTraining() {
  const nav = useNavigate();
  const { data: trainings } = useVocalTrainings();
  const { data: completed } = useMyCompletedTrainings();
  const markDone = useMarkTrainingComplete();

  const builtin = (trainings ?? []).filter((t) => t.is_builtin);
  const custom = (trainings ?? []).filter((t) => !t.is_builtin);

  return (
    <div className="pb-10">
      <ScreenHeader title="Vocal training" onBack={() => nav(-1)} />
      <div className="px-5">
        <SectionTitle>Built-in exercises</SectionTitle>
        <div className="flex flex-col gap-2.5">
          {builtin.map((t) => {
            const done = completed?.has(t.id);
            return (
              <Card key={t.id} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.title}</div>
                  <div className="text-xs text-ink3 mt-0.5">{CATEGORY_LABEL[t.category]}</div>
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
          })}
          {!builtin.length && <div className="text-sm text-ink3">No exercises yet.</div>}
        </div>

        {!!custom.length && (
          <>
            <SectionTitle>From your director</SectionTitle>
            <div className="flex flex-col gap-2.5">
              {custom.map((t) => {
                const done = completed?.has(t.id);
                return (
                  <Card key={t.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm">{t.title}</div>
                      <div className="text-xs text-ink3 mt-0.5">{CATEGORY_LABEL[t.category]}</div>
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
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
