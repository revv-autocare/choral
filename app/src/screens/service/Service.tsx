import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNextService, useServiceChecklist, useToggleChecklistItem, useServiceDuties, useAssignDuty } from '../../hooks/useService';
import { useArrangementSongs } from '../../hooks/useArrangements';
import { useMembers } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';

const DUTIES = [
  { key: 'lead', label: 'P&W Lead' },
  { key: 'backup', label: 'Backup vocal' },
  { key: 'keys', label: 'Keys' },
  { key: 'drums', label: 'Drums' },
  { key: 'bass', label: 'Bass' },
  { key: 'sound', label: 'Sound' },
];

export default function Service() {
  const nav = useNavigate();
  const { can } = usePermissions();
  const { data: service } = useNextService();
  const { data: checklist } = useServiceChecklist(service?.id);
  const toggle = useToggleChecklistItem(service?.id ?? '');
  const { data: duties } = useServiceDuties(service?.id);
  const assign = useAssignDuty(service?.id ?? '');
  const { data: songs } = useArrangementSongs(service?.pw_arrangement_id ?? undefined);
  const { data: members } = useMembers();

  const [assigning, setAssigning] = useState<string | null>(null);

  if (!service) {
    return (
      <div className="pb-10">
        <ScreenHeader title="Service day" />
        <div className="px-5 text-sm text-ink3">No upcoming service scheduled.</div>
      </div>
    );
  }

  function dutyMember(key: string) {
    const d = duties?.find((x) => x.duty_key === key);
    return members?.find((m) => m.id === d?.member_id);
  }

  return (
    <div className="pb-10">
      <ScreenHeader title="Service day" />
      <div className="px-5">
        <div className="text-sm text-ink2">
          {new Date(service.service_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className="flex gap-4 mt-2 text-xs font-semibold text-ink2">
          {service.call_time && <span>Call time {service.call_time}</span>}
          {service.service_time && <span>Service {service.service_time}</span>}
        </div>

        <SectionTitle>Checklist</SectionTitle>
        <Card className="p-1">
          {(checklist ?? []).map((item, i) => (
            <button
              key={item.id}
              onClick={() => toggle.mutate({ id: item.id, done: !item.done })}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-left ${i > 0 ? 'border-t border-line' : ''}`}
            >
              <span
                className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                style={{ background: item.done ? '#3E7C53' : 'transparent', borderColor: item.done ? '#3E7C53' : '#DED5C2' }}
              >
                {item.done && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M5 13l4 4 10-10" /></svg>
                )}
              </span>
              <span className={`text-sm font-medium ${item.done ? 'text-ink3 line-through' : ''}`}>{item.label}</span>
            </button>
          ))}
          {!checklist?.length && <div className="px-3.5 py-3 text-sm text-ink3">No tasks yet.</div>}
        </Card>

        <SectionTitle>Duties</SectionTitle>
        <div className="flex flex-col gap-2">
          {DUTIES.map((d) => {
            const m = dutyMember(d.key);
            return (
              <Card key={d.key} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{d.label}</div>
                  <div className="text-xs text-ink3 mt-0.5">{m?.name ?? 'Unassigned'}</div>
                </div>
                {can('assign_lead') && (
                  <button onClick={() => setAssigning(d.key)} className="text-xs font-semibold text-indigo">
                    {m ? 'Change' : 'Assign'}
                  </button>
                )}
              </Card>
            );
          })}
        </div>

        {service.pw_arrangement_id && (
          <>
            <SectionTitle
              action={
                <button onClick={() => nav(`/pw/${service.pw_arrangement_id}`)} className="text-xs font-semibold text-indigo">
                  Open arrangement
                </button>
              }
            >
              Song order
            </SectionTitle>
            <Card className="p-1">
              {(songs ?? []).map((s, i) => (
                <div key={s.song.id} className={`flex items-center gap-3 px-3.5 py-3 ${i > 0 ? 'border-t border-line' : ''}`}>
                  <div className="text-xs font-semibold text-ink3 w-5">{i + 1}</div>
                  <div className="text-sm font-semibold flex-1">{s.song.title}</div>
                  <div className="text-xs text-ink3">{s.song.song_key}</div>
                </div>
              ))}
              {!songs?.length && <div className="px-3.5 py-3 text-sm text-ink3">No songs set yet.</div>}
            </Card>
          </>
        )}
      </div>

      <Sheet open={!!assigning} onClose={() => setAssigning(null)} title="Assign duty">
        <div className="flex flex-col gap-2">
          {(members ?? []).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                if (assigning) assign.mutate({ dutyKey: assigning, memberId: m.id });
                setAssigning(null);
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
