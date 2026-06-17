import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNextService,
  useServiceChecklist,
  useToggleChecklistItem,
  useServiceDuties,
  useAssignDuty,
  useCreateService,
  useUpdateService,
  useAddChecklistItem,
  useAddServiceSong,
} from '../../hooks/useService';
import { useArrangementSongs } from '../../hooks/useArrangements';
import { useSongs } from '../../hooks/useSongs';
import { useMembers } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/Toast';

const DUTIES = [
  { key: 'lead', label: 'P&W Lead' },
  { key: 'backup', label: 'Backup vocal' },
  { key: 'keys', label: 'Keys' },
  { key: 'drums', label: 'Drums' },
  { key: 'bass', label: 'Bass' },
  { key: 'sound', label: 'Sound' },
];

type SheetKind = 'duty' | 'info' | 'check' | 'song' | null;

export default function Service() {
  const nav = useNavigate();
  const { show } = useToast();
  const { can, isAdmin, isLeadOrAbove } = usePermissions();
  const { data: service } = useNextService();
  const { data: checklist } = useServiceChecklist(service?.id);
  const toggle = useToggleChecklistItem(service?.id ?? '');
  const { data: duties } = useServiceDuties(service?.id);
  const assign = useAssignDuty(service?.id ?? '');
  const { data: songs } = useArrangementSongs(service?.pw_arrangement_id ?? undefined);
  const { data: allSongs } = useSongs();
  const { data: members } = useMembers();

  const createService = useCreateService();
  const updateService = useUpdateService(service?.id ?? '');
  const addCheckItem = useAddChecklistItem(service?.id ?? '');
  const addSong = useAddServiceSong(service);

  const [sheet, setSheet] = useState<SheetKind>(null);
  const [dutyKey, setDutyKey] = useState<string | null>(null);
  // form fields
  const [date, setDate] = useState('');
  const [call, setCall] = useState('');
  const [svcTime, setSvcTime] = useState('');
  const [checkText, setCheckText] = useState('');

  function dutyMember(key: string) {
    const d = duties?.find((x) => x.duty_key === key);
    return members?.find((m) => m.id === d?.member_id);
  }

  async function scheduleService() {
    if (!date) {
      show('Pick a date');
      return;
    }
    await createService.mutateAsync({ service_date: date, call_time: call || null, service_time: svcTime || null });
    setSheet(null);
    setDate('');
    setCall('');
    setSvcTime('');
    show('Service scheduled');
  }

  async function saveInfo() {
    await updateService.mutateAsync({
      ...(date ? { service_date: date } : {}),
      ...(call ? { call_time: call } : {}),
      ...(svcTime ? { service_time: svcTime } : {}),
    });
    setSheet(null);
    show('Service details saved');
  }

  async function saveCheck() {
    if (!checkText.trim()) {
      show('Enter the item');
      return;
    }
    await addCheckItem.mutateAsync({ label: checkText.trim(), position: checklist?.length ?? 0 });
    setCheckText('');
    setSheet(null);
    show('Checklist item added');
  }

  // -- Empty state: no upcoming service --
  if (!service) {
    return (
      <div className="pb-10">
        <ScreenHeader title="Service day" />
        <div className="px-5">
          <div className="text-sm text-ink3">No upcoming service scheduled.</div>
          {isAdmin && (
            <Button className="w-full mt-4" onClick={() => setSheet('info')}>
              Schedule a service
            </Button>
          )}
        </div>
        <Sheet open={sheet === 'info'} onClose={() => setSheet(null)} title="Schedule service">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-ink3">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
            <label className="text-xs font-semibold text-ink3">Call time</label>
            <input type="time" value={call} onChange={(e) => setCall(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
            <label className="text-xs font-semibold text-ink3">Service time</label>
            <input type="time" value={svcTime} onChange={(e) => setSvcTime(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
            <Button onClick={scheduleService}>Schedule</Button>
          </div>
        </Sheet>
      </div>
    );
  }

  const usedSongIds = new Set((songs ?? []).map((s) => s.song.id));
  const pickableSongs = (allSongs ?? []).filter((s) => !usedSongIds.has(s.id));

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Service day"
        right={
          isAdmin && (
            <button onClick={() => setSheet('info')} className="text-xs font-semibold text-indigo">
              Edit
            </button>
          )
        }
      />
      <div className="px-5">
        <div className="text-sm text-ink2">
          {new Date(service.service_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div className="flex gap-4 mt-2 text-xs font-semibold text-ink2">
          {service.call_time && <span>Call time {service.call_time}</span>}
          {service.service_time && <span>Service {service.service_time}</span>}
        </div>

        <SectionTitle
          action={
            isLeadOrAbove && (
              <button onClick={() => setSheet('check')} className="text-xs font-semibold text-indigo">
                + Add
              </button>
            )
          }
        >
          Checklist
        </SectionTitle>
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
                  <button
                    onClick={() => {
                      setDutyKey(d.key);
                      setSheet('duty');
                    }}
                    className="text-xs font-semibold text-indigo"
                  >
                    {m ? 'Change' : 'Assign'}
                  </button>
                )}
              </Card>
            );
          })}
        </div>

        <SectionTitle
          action={
            <div className="flex items-center gap-3">
              {isLeadOrAbove && (
                <button onClick={() => setSheet('song')} className="text-xs font-semibold text-indigo">
                  + Add
                </button>
              )}
              {service.pw_arrangement_id && (
                <button onClick={() => nav(`/pw/${service.pw_arrangement_id}`)} className="text-xs font-semibold text-indigo">
                  Open
                </button>
              )}
            </div>
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
      </div>

      {/* Assign duty */}
      <Sheet open={sheet === 'duty'} onClose={() => setSheet(null)} title="Assign duty">
        <div className="flex flex-col gap-2">
          {(members ?? []).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                if (dutyKey) assign.mutate({ dutyKey, memberId: m.id });
                setSheet(null);
              }}
              className="w-full text-left px-3.5 py-3 rounded-xl bg-surface border border-line text-sm font-semibold"
            >
              {m.name}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Edit service info */}
      <Sheet open={sheet === 'info'} onClose={() => setSheet(null)} title="Edit service">
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-ink3">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <label className="text-xs font-semibold text-ink3">Call time</label>
          <input type="time" value={call} onChange={(e) => setCall(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <label className="text-xs font-semibold text-ink3">Service time</label>
          <input type="time" value={svcTime} onChange={(e) => setSvcTime(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <Button onClick={saveInfo}>Save details</Button>
        </div>
      </Sheet>

      {/* Add checklist item */}
      <Sheet open={sheet === 'check'} onClose={() => setSheet(null)} title="Add checklist item">
        <div className="flex flex-col gap-3">
          <input value={checkText} onChange={(e) => setCheckText(e.target.value)} placeholder="e.g. Charge in-ear packs" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <Button onClick={saveCheck}>Add item</Button>
        </div>
      </Sheet>

      {/* Add song to order */}
      <Sheet open={sheet === 'song'} onClose={() => setSheet(null)} title="Add to song order">
        <div className="flex flex-col gap-2">
          {pickableSongs.map((s) => (
            <button
              key={s.id}
              onClick={async () => {
                await addSong.mutateAsync({ songId: s.id, position: songs?.length ?? 0 });
                setSheet(null);
                show(`${s.title} added to order`);
              }}
              className="w-full text-left px-3.5 py-3 rounded-xl bg-surface border border-line text-sm font-semibold flex items-center justify-between"
            >
              <span>{s.title}</span>
              <span className="text-xs text-ink3">{s.song_key}</span>
            </button>
          ))}
          {!pickableSongs.length && <div className="text-sm text-ink3 px-1 py-2">All songs are already in the order.</div>}
        </div>
      </Sheet>
    </div>
  );
}
