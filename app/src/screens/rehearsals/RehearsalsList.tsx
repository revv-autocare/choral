import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRehearsals, useNextRehearsal, useAgenda, useCreateRehearsal } from '../../hooks/useRehearsals';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/Toast';

export default function RehearsalsList() {
  const nav = useNavigate();
  const { show } = useToast();
  const { isAdmin } = usePermissions();
  const { data: rehearsals } = useRehearsals();
  const { data: next } = useNextRehearsal();
  const { data: agenda } = useAgenda(next?.id);
  const create = useCreateRehearsal();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [when, setWhen] = useState('');
  const [place, setPlace] = useState('');

  const past = (rehearsals ?? []).filter((r) => r.id !== next?.id);
  const totalMins = (agenda ?? []).reduce((s, a) => s + a.minutes, 0);

  async function save() {
    if (!title.trim() || !when) {
      show('Add a title and date');
      return;
    }
    const created = await create.mutateAsync({
      title: title.trim(),
      place: place.trim() || 'Main Auditorium',
      starts_at: new Date(when).toISOString(),
    });
    setTitle('');
    setWhen('');
    setPlace('');
    setOpen(false);
    show('Rehearsal created · build the agenda');
    nav(`/rehearsals/${created.id}`);
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="font-serif font-semibold text-2xl">Rehearsals</div>
        {isAdmin && (
          <button onClick={() => setOpen(true)} className="text-sm font-semibold text-indigo">
            + New
          </button>
        )}
      </div>

      {next && (
        <button onClick={() => nav(`/rehearsals/${next.id}`)} className="w-full text-left">
          <Card className="p-5">
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

      {!next && !past.length && (
        <div className="text-sm text-ink3 mt-2">
          No rehearsals yet.{isAdmin ? ' Tap “+ New” to schedule one.' : ''}
        </div>
      )}

      {!!past.length && <div className="font-semibold text-base mt-6 mb-3">Past rehearsals</div>}
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
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="New rehearsal">
        <div className="flex flex-col gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Sunday Prep)" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <label className="text-xs font-semibold text-ink3">Date &amp; time</label>
          <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Location" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <Button onClick={save}>Create rehearsal</Button>
        </div>
      </Sheet>
    </div>
  );
}
