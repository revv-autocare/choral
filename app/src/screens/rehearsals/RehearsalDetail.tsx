import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRehearsal, useAgenda, useAddAgendaItem } from '../../hooks/useRehearsals';
import { useMembers } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, ScreenHeader } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/Toast';

export default function RehearsalDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { show } = useToast();
  const { isLeadOrAbove } = usePermissions();
  const { data: rehearsal } = useRehearsal(id);
  const { data: agenda } = useAgenda(id);
  const { data: members } = useMembers();
  const addItem = useAddAgendaItem(id ?? '');

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [minutes, setMinutes] = useState('10');
  const [ownerId, setOwnerId] = useState<string | null>(null);

  if (!rehearsal) return <div className="px-5 pt-10 text-ink3 text-sm">Loading...</div>;

  const ownerName = (oid: string | null) => members?.find((m) => m.id === oid)?.name ?? 'Unassigned';
  const ownerInitials = (oid: string | null) => {
    const m = members?.find((x) => x.id === oid);
    return m ? m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '--';
  };

  async function save() {
    if (!name.trim()) {
      show('Name the item');
      return;
    }
    await addItem.mutateAsync({
      name: name.trim(),
      minutes: Number(minutes) || 10,
      owner_id: ownerId,
      position: agenda?.length ?? 0,
    });
    setName('');
    setMinutes('10');
    setOwnerId(null);
    setOpen(false);
    show('Agenda item added');
  }

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Agenda"
        onBack={() => nav(-1)}
        right={
          <button onClick={() => nav(`/rehearsals/${id}/qr`)} className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#241F1A" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
          </button>
        }
      />
      <div className="px-5">
        <div className="font-serif text-xl font-semibold">{rehearsal.title}</div>
        <div className="text-sm text-ink2 mt-1">
          {new Date(rehearsal.starts_at).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit' })} &middot; {rehearsal.place}
        </div>

        <div className="flex items-center justify-between mt-6 mb-1">
          <div className="font-semibold text-sm">Agenda</div>
          {isLeadOrAbove && (
            <button onClick={() => setOpen(true)} className="text-xs font-semibold text-indigo">
              + Add item
            </button>
          )}
        </div>

        <div className="mt-3 relative">
          {(agenda ?? []).map((item, i) => (
            <div key={item.id} className="flex gap-3 pb-6 relative">
              {i < (agenda?.length ?? 0) - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-line2" />}
              <div className="w-8 h-8 rounded-full bg-indigo-soft text-indigo-d font-semibold text-sm flex items-center justify-center shrink-0 z-10">
                {i + 1}
              </div>
              <div className="flex-1 bg-surface border border-line rounded-2xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs font-semibold text-ink3">{item.minutes} min</div>
                </div>
                <div className="text-xs text-ink2 mt-1">{ownerInitials(item.owner_id)} &middot; {ownerName(item.owner_id)}</div>
              </div>
            </div>
          ))}
          {!agenda?.length && (
            <div className="text-sm text-ink3 mb-4">
              No agenda yet.{isLeadOrAbove ? ' Add the first item to build the run sheet.' : ''}
            </div>
          )}
        </div>

        {!!agenda?.length && (
          <Button className="w-full mt-2" onClick={() => nav(`/rehearsals/${id}/live`)}>
            Start rehearsal
          </Button>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Add agenda item">
        <div className="flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item (e.g. Alto sectional)" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <div className="flex items-center gap-2">
            <input type="number" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface w-24" />
            <span className="text-sm text-ink2">minutes</span>
          </div>
          <div className="text-xs font-semibold text-ink3 mt-1">
            Owner <span className="text-indigo">{ownerId ? ownerName(ownerId) : 'Tap a member'}</span>
          </div>
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
            {(members ?? []).map((m) => (
              <button
                key={m.id}
                onClick={() => setOwnerId(ownerId === m.id ? null : m.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm font-semibold ${ownerId === m.id ? 'bg-indigo text-white border-indigo' : 'bg-surface text-ink border-line'}`}
              >
                {m.name}
              </button>
            ))}
          </div>
          <Button onClick={save}>Add to agenda</Button>
        </div>
      </Sheet>
    </div>
  );
}
