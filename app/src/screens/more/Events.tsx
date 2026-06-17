import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpecialEvents, useTasksForEvent, useCreateTask, useAssignTask, useCreateEvent } from '../../hooks/useEvents';
import { useMembers } from '../../hooks/useMembers';
import { usePermissions } from '../../hooks/usePermissions';
import { Button, Card, ScreenHeader, SectionTitle } from '../../components/ui/primitives';
import { Sheet } from '../../components/ui/Sheet';
import { useToast } from '../../components/ui/Toast';

export default function Events() {
  const nav = useNavigate();
  const { show } = useToast();
  const { can, isAdmin } = usePermissions();
  const { data: events } = useSpecialEvents();
  const { data: members } = useMembers();

  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const { data: tasks } = useTasksForEvent(activeEvent ?? undefined);
  const createTask = useCreateTask();
  const assignTask = useAssignTask();
  const createEvent = useCreateEvent();

  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [assigning, setAssigning] = useState<string | null>(null);

  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');

  const event = events?.find((e) => e.id === activeEvent);

  async function addEvent() {
    if (!evTitle.trim() || !evDate) {
      show('Add a title and date');
      return;
    }
    await createEvent.mutateAsync({ title: evTitle.trim(), event_date: evDate });
    setEvTitle('');
    setEvDate('');
    setEventSheetOpen(false);
    show('Event created');
  }

  async function addTask() {
    if (!taskTitle.trim() || !activeEvent) return;
    await createTask.mutateAsync({ title: taskTitle, special_event_id: activeEvent });
    setTaskTitle('');
    setTaskSheetOpen(false);
  }

  if (activeEvent && event) {
    return (
      <div className="pb-10">
        <ScreenHeader title={event.title} onBack={() => setActiveEvent(null)} />
        <div className="px-5">
          <div className="text-sm text-ink2">
            {new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>

          <SectionTitle
            action={
              can('assign_owner') && (
                <button onClick={() => setTaskSheetOpen(true)} className="text-xs font-semibold text-indigo">
                  Add task
                </button>
              )
            }
          >
            Action points
          </SectionTitle>
          <Card className="p-1">
            {(tasks ?? []).map((t, i) => {
              const owner = members?.find((m) => m.id === t.assignee_id);
              return (
                <div key={t.id} className={`flex items-center gap-3 px-3.5 py-3 ${i > 0 ? 'border-t border-line' : ''}`}>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{t.title}</div>
                    <div className="text-xs text-ink3 mt-0.5">{owner?.name ?? 'Unassigned'}</div>
                  </div>
                  {can('assign_owner') && (
                    <button onClick={() => setAssigning(t.id)} className="text-xs font-semibold text-indigo">
                      {owner ? 'Reassign' : 'Assign'}
                    </button>
                  )}
                </div>
              );
            })}
            {!tasks?.length && <div className="px-3.5 py-3 text-sm text-ink3">No action points yet.</div>}
          </Card>
        </div>

        <Sheet open={taskSheetOpen} onClose={() => setTaskSheetOpen(false)} title="New action point">
          <div className="flex flex-col gap-3">
            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="What needs to happen" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
            <Button onClick={addTask}>Add</Button>
          </div>
        </Sheet>

        <Sheet open={!!assigning} onClose={() => setAssigning(null)} title="Assign owner">
          <div className="flex flex-col gap-2">
            {(members ?? []).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  if (assigning) assignTask.mutate({ id: assigning, assignee_id: m.id });
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

  return (
    <div className="pb-10">
      <ScreenHeader
        title="Special events"
        onBack={() => nav(-1)}
        right={
          isAdmin && (
            <button onClick={() => setEventSheetOpen(true)} className="text-xs font-semibold text-indigo">
              + New
            </button>
          )
        }
      />
      <div className="px-5 flex flex-col gap-2.5">
        {(events ?? []).map((e) => (
          <button key={e.id} onClick={() => setActiveEvent(e.id)} className="w-full text-left">
            <Card className="p-4 flex items-center gap-3.5">
              <div className="text-center w-12 shrink-0">
                <div className="font-serif font-semibold text-lg">{new Date(e.event_date).getDate()}</div>
                <div className="text-[10px] uppercase font-semibold text-ink3">
                  {new Date(e.event_date).toLocaleString(undefined, { month: 'short' })}
                </div>
              </div>
              <div className="font-semibold text-sm">{e.title}</div>
            </Card>
          </button>
        ))}
        {!events?.length && <div className="text-sm text-ink3">No special events scheduled.</div>}
      </div>

      <Sheet open={eventSheetOpen} onClose={() => setEventSheetOpen(false)} title="New event">
        <div className="flex flex-col gap-3">
          <input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Event title" className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <label className="text-xs font-semibold text-ink3">Date</label>
          <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface" />
          <Button onClick={addEvent}>Create event</Button>
        </div>
      </Sheet>
    </div>
  );
}
