import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChoirName } from '../hooks/useChoir';
import { usePermissions } from '../hooks/usePermissions';
import { useNextRehearsal, useAgenda } from '../hooks/useRehearsals';
import { useSongs } from '../hooks/useSongs';
import { useMyTasks } from '../hooks/useEvents';
import { Avatar, Card } from '../components/ui/primitives';

function initialsOf(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function Home() {
  const nav = useNavigate();
  const { member } = useAuth();
  const choirName = useChoirName();
  const { can, roleLabel } = usePermissions();
  const { data: nextRehearsal } = useNextRehearsal();
  const { data: agenda } = useAgenda(nextRehearsal?.id);
  const { data: songs } = useSongs();
  const { data: myTasks } = useMyTasks();

  const myDuty = agenda?.find((a) => a.owner_id === member?.id);
  const learnList = (songs ?? []).filter((s) => s.coming).slice(0, 6);

  const greetHour = new Date().getHours();
  const greetLabel = greetHour < 12 ? 'Good morning' : greetHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-7 pb-4">
        <Avatar initials={initialsOf(member?.name ?? '')} color={member?.color ?? '#3F3795'} size={42} />
        <div className="flex-1">
          <div className="text-[10px] font-semibold tracking-[.16em] uppercase text-ink3">{greetLabel}</div>
          <div className="font-semibold text-[17px] mt-0.5">{member?.name}</div>
        </div>
        <button
          onClick={() => nav('/more/board')}
          className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center relative"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#5E574D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-gold rounded-full border-2 border-surface" />
        </button>
      </div>

      <div className="px-5">
        <div className="font-serif italic text-[13px] text-ink3 mb-3.5">{choirName}</div>

        {nextRehearsal ? (
          <div
            className="rounded-3xl p-5 text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(155deg,#2C2670,#3F3795 62%,#5C53C4)', boxShadow: '0 20px 40px -16px rgba(43,38,112,.6)' }}
          >
            <div className="text-[10px] font-semibold tracking-[.16em] uppercase text-white/70">Rehearsal tonight</div>
            <div className="font-serif text-2xl font-medium mt-2">{nextRehearsal.title}</div>
            <div className="text-[13px] font-medium text-white/85 mt-1.5">
              {new Date(nextRehearsal.starts_at).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })} &middot; {nextRehearsal.place}
            </div>
            {myDuty && (
              <div className="mt-4 px-3.5 py-2.5 bg-white/[.13] rounded-2xl flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F4EAD4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                </svg>
                <div className="text-[13px] font-medium">You're leading <strong className="font-semibold">{myDuty.name}</strong></div>
              </div>
            )}
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => nav(`/rehearsals/${nextRehearsal.id}`)}
                className="flex-1 text-center py-3.5 bg-white text-indigo-d rounded-2xl font-semibold text-sm"
              >
                View agenda
              </button>
              <button
                onClick={() => nav(`/rehearsals/${nextRehearsal.id}/qr`)}
                className="px-4 py-3.5 bg-white/15 rounded-2xl font-semibold text-sm flex items-center gap-1.5"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                Sign in
              </button>
            </div>
          </div>
        ) : (
          <Card className="p-5 text-center text-ink2 text-sm">No upcoming rehearsal scheduled.</Card>
        )}

        {can('add_song') && (
          <Card className="mt-4.5 mt-[18px] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-[11px] font-semibold tracking-[.13em] uppercase text-gold-d">{roleLabel} actions</span>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => nav('/more/members')} className="flex-1 flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-2xl bg-surface2 border border-line">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F3795" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M19 8v6M22 11h-6" /></svg>
                <span className="text-[11px] font-semibold">Add member</span>
              </button>
              <button onClick={() => nav('/more/board')} className="flex-1 flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-2xl bg-surface2 border border-line">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F3795" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
                <span className="text-[11px] font-semibold">Announce</span>
              </button>
              <button onClick={() => nav('/songs/new')} className="flex-1 flex flex-col items-center gap-1.5 py-3 px-1.5 rounded-2xl bg-surface2 border border-line">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F3795" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></svg>
                <span className="text-[11px] font-semibold">Add song</span>
              </button>
            </div>
          </Card>
        )}

        {!!myTasks?.length && (
          <>
            <div className="mt-6 mb-3 font-semibold text-base">My tasks</div>
            {myTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-3.5 py-3 bg-surface border border-line rounded-2xl mb-2">
                <span className="w-2 h-2 rounded-full bg-gold shrink-0" />
                <div className="flex-1">
                  <div className="font-semibold text-[13px]">{t.title}</div>
                  <div className="text-[11px] text-ink3 mt-0.5">Due {t.due_date ?? 'soon'}</div>
                </div>
                <span className="text-[11px] font-semibold text-ink2">{t.status}</span>
              </div>
            ))}
          </>
        )}

        <div className="flex items-baseline justify-between mt-6 mb-3">
          <div className="font-semibold text-base">Learn this week</div>
          <button onClick={() => nav('/songs')} className="text-xs font-semibold text-indigo">Song Bank</button>
        </div>
        <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2">
          {learnList.map((sg) => (
            <button
              key={sg.id}
              onClick={() => nav(`/songs/${sg.id}`)}
              className="shrink-0 w-[156px] bg-surface border border-line rounded-3xl p-4 text-left"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] px-2 py-1 rounded-md bg-indigo-soft text-indigo-d">{sg.song_key}</span>
                <span className="text-[11px] font-medium text-ink3">{sg.tempo} bpm</span>
              </div>
              <div className="font-serif font-semibold text-[15px] mt-3 min-h-[38px]">{sg.title}</div>
              <div className="text-[11px] text-ink3 mt-0.5">{sg.composer}</div>
            </button>
          ))}
          {!learnList.length && <div className="text-sm text-ink3 py-4">Nothing flagged for rehearsal yet.</div>}
        </div>
      </div>
    </div>
  );
}
