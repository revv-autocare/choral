import { useNavigate, useParams } from 'react-router-dom';
import { useRehearsal, useAgenda } from '../../hooks/useRehearsals';
import { useMembers } from '../../hooks/useMembers';
import { Button, ScreenHeader } from '../../components/ui/primitives';

export default function RehearsalDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: rehearsal } = useRehearsal(id);
  const { data: agenda } = useAgenda(id);
  const { data: members } = useMembers();

  if (!rehearsal) return <div className="px-5 pt-10 text-ink3 text-sm">Loading...</div>;

  const ownerName = (ownerId: string | null) => members?.find((m) => m.id === ownerId)?.name ?? 'Unassigned';
  const ownerInitials = (ownerId: string | null) => {
    const m = members?.find((x) => x.id === ownerId);
    return m ? m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '--';
  };

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

        <div className="mt-6 relative">
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
          {!agenda?.length && <div className="text-sm text-ink3">No agenda yet.</div>}
        </div>

        <Button className="w-full mt-2" onClick={() => nav(`/rehearsals/${id}/live`)}>
          Start rehearsal
        </Button>
      </div>
    </div>
  );
}
