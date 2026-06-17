import { useNavigate } from 'react-router-dom';
import { useRehearsals, useNextRehearsal, useAgenda } from '../../hooks/useRehearsals';
import { Card } from '../../components/ui/primitives';

export default function RehearsalsList() {
  const nav = useNavigate();
  const { data: rehearsals } = useRehearsals();
  const { data: next } = useNextRehearsal();
  const { data: agenda } = useAgenda(next?.id);

  const past = (rehearsals ?? []).filter((r) => r.id !== next?.id);
  const totalMins = (agenda ?? []).reduce((s, a) => s + a.minutes, 0);

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="font-serif font-semibold text-2xl mb-4">Rehearsals</div>

      {next && (
        <button onClick={() => nav(`/rehearsals/${next.id}`)} className="w-full text-left">
          <Card className="p-5" >
            <div className="text-[10px] font-semibold tracking-[.16em] uppercase text-indigo">Up next</div>
            <div className="font-serif text-xl font-semibold mt-2">{next.title}</div>
            <div className="text-sm text-ink2 mt-1">
              {new Date(next.starts_at).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })} &middot; {next.place}
            </div>
            <div className="flex gap-4 mt-3 text-xs font-semibold text-ink2">
              <span>{agenda?.length ?? 0} agenda items</span>
              <span>{totalMins} min total</span>
            </div>
          </Card>
        </button>
      )}

      <div className="font-semibold text-base mt-6 mb-3">Past rehearsals</div>
      <div className="flex flex-col gap-2.5">
        {past.map((r) => (
          <button key={r.id} onClick={() => nav(`/rehearsals/${r.id}`)} className="w-full text-left">
            <Card className="p-4 flex items-center gap-3.5">
              <div className="text-center w-12 shrink-0">
                <div className="font-serif font-semibold text-lg">{new Date(r.starts_at).getDate()}</div>
                <div className="text-[10px] uppercase font-semibold text-ink3">
                  {new Date(r.starts_at).toLocaleString(undefined, { month: 'short' })}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{r.title}</div>
                <div className="text-xs text-ink3 mt-0.5">{r.place}</div>
              </div>
              <div className="text-xs font-semibold text-ink2">{r.attendanceCount} attended</div>
            </Card>
          </button>
        ))}
        {!past.length && <div className="text-sm text-ink3">No past rehearsals yet.</div>}
      </div>
    </div>
  );
}
