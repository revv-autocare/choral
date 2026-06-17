import { useNavigate, useParams } from 'react-router-dom';
import { useArrangement, useArrangementSongs, usePraiseLoops, useSetArrangementLead } from '../../hooks/useArrangements';
import { useMembers } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { Avatar, Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import { useState } from 'react';
import { Sheet } from '../../components/ui/Sheet';

export default function PraiseWorship() {
  const { id } = useParams();
  const nav = useNavigate();
  const { can } = usePermissions();
  const { data: arrangement } = useArrangement(id);
  const { data: songs } = useArrangementSongs(id);
  const { data: loops } = usePraiseLoops(id);
  const { data: members } = useMembers();
  const setLead = useSetArrangementLead(id ?? '');
  const [pickingLead, setPickingLead] = useState(false);

  if (!arrangement) return <div className="px-5 pt-10 text-ink3 text-sm">Loading...</div>;

  const lead = members?.find((m) => m.id === arrangement.lead_member_id);
  const isMinistration = arrangement.type === 'ministration';

  return (
    <div className="pb-10">
      <ScreenHeader title={arrangement.title} onBack={() => nav(-1)} />
      <div className="px-5">
        <Card className="p-4 flex items-center gap-3.5">
          <Avatar initials={lead ? lead.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '--'} color={lead?.color ?? '#5C53C4'} size={40} />
          <div className="flex-1">
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-ink3">{isMinistration ? 'Ministering' : 'Leading'}</div>
            <div className="font-semibold text-sm mt-0.5">{lead?.name ?? 'Unassigned'}</div>
          </div>
          {can('assign_lead') && (
            <button onClick={() => setPickingLead(true)} className="text-xs font-semibold text-indigo">
              {lead ? 'Change' : 'Assign'}
            </button>
          )}
        </Card>

        <SectionTitle>Song order</SectionTitle>
        <Card className="p-1">
          {(songs ?? []).map((s, i) => (
            <button
              key={s.song.id}
              onClick={() => nav(`/songs/${s.song.id}`)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <div className="text-xs font-semibold text-ink3 w-5">{i + 1}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{s.song.title}</div>
                <div className="text-xs text-ink3">{s.song.composer}</div>
              </div>
              <div className="font-mono text-xs px-2 py-1 rounded-md bg-indigo-soft text-indigo-d font-semibold">{s.song.song_key}</div>
            </button>
          ))}
          {!songs?.length && <div className="px-3.5 py-3 text-sm text-ink3">No songs added yet.</div>}
        </Card>

        {!isMinistration && (
          <>
            <SectionTitle>Loops &amp; transitions</SectionTitle>
            <div className="flex flex-col gap-2">
              {(loops ?? []).map((l) => (
                <Card key={l.id} className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{l.name}</div>
                    <div className="text-xs text-ink3 mt-0.5 capitalize">{l.kind}</div>
                  </div>
                  {l.audio_path && (
                    <div className="w-8 h-8 rounded-full bg-indigo-soft flex items-center justify-center">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="#3F3795"><path d="M6 4l15 8-15 8z" /></svg>
                    </div>
                  )}
                </Card>
              ))}
              {!loops?.length && <div className="text-sm text-ink3">No loops added yet.</div>}
            </div>
          </>
        )}
      </div>

      <Sheet open={pickingLead} onClose={() => setPickingLead(false)} title={isMinistration ? 'Assign minister' : 'Assign lead'}>
        <div className="flex flex-col gap-2">
          {(members ?? []).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setLead.mutate(m.id);
                setPickingLead(false);
              }}
              className="w-full text-left px-3.5 py-3 rounded-xl bg-surface border border-line text-sm font-semibold"
            >
              {m.name}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
