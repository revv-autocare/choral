import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useRehearsal, useAttendance, useAttendanceToken, useSignIn } from '../../hooks/useRehearsals';
import { useMembers } from '../../hooks/useMembers';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { Avatar, Button } from '../../components/ui/primitives';

export default function QrAttendance() {
  const { id } = useParams();
  const nav = useNavigate();
  const { member } = useAuth();
  const { isAdmin } = usePermissions();
  const { data: rehearsal } = useRehearsal(id);
  const { data: attendance } = useAttendance(id);
  const { data: members } = useMembers();
  const { data: token, rotate } = useAttendanceToken(id);
  const signIn = useSignIn(id ?? '');

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const rotating = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const expired = !token || new Date(token.expires_at).getTime() <= now;

  useEffect(() => {
    if (expired && !rotating.current && id) {
      rotating.current = true;
      rotate.mutate(undefined, { onSettled: () => { rotating.current = false; } });
    }
  }, [expired, id, rotate]);

  useEffect(() => {
    if (!token) return;
    const value = JSON.stringify({ rehearsalId: id, token: token.token });
    QRCode.toDataURL(value, { width: 360, margin: 1, color: { dark: '#1B1740', light: '#F4EFE3' } }).then(setQrUrl);
  }, [token, id]);

  const secsLeft = token ? Math.max(0, Math.round((new Date(token.expires_at).getTime() - now) / 1000)) : 0;
  const signedInIds = new Set((attendance ?? []).map((a) => a.member_id));
  const alreadyIn = !!member && signedInIds.has(member.id);

  function selfSignIn() {
    if (!member || !rehearsal) return;
    const onTime = Date.now() <= new Date(rehearsal.starts_at).getTime() + 10 * 60_000;
    signIn.mutate({ memberId: member.id, onTime });
  }

  return (
    <div className="min-h-screen flex flex-col text-white px-6 pt-6 pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => nav(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="font-serif font-semibold text-xl">Attendance</div>
      </div>

      {isAdmin ? (
        <>
          <div className="text-center text-sm text-white/60 mt-6">Scan to check in</div>
          <div className="mx-auto mt-4 bg-paper rounded-3xl p-5">
            {qrUrl ? <img src={qrUrl} width={260} height={260} alt="Attendance QR code" /> : <div className="w-[260px] h-[260px]" />}
          </div>
          <div className="text-center mt-4">
            <div className="font-mono text-3xl font-semibold tracking-[.2em]">{token?.token ?? '------'}</div>
            <div className="text-xs text-white/50 mt-1">Refreshes in {secsLeft}s</div>
          </div>
        </>
      ) : (
        <div className="mt-10 text-center">
          <div className="text-sm text-white/60">Tap below when you arrive</div>
          <Button className="mt-4 w-full" onClick={selfSignIn} disabled={alreadyIn}>
            {alreadyIn ? "You're checked in" : "I'm here"}
          </Button>
        </div>
      )}

      <div className="mt-8 flex-1">
        <div className="text-xs font-semibold uppercase tracking-[.12em] text-white/50 mb-3">
          Checked in &middot; {attendance?.length ?? 0}
        </div>
        <div className="flex flex-col gap-2.5">
          {(attendance ?? []).map((a) => {
            const m = members?.find((x) => x.id === a.member_id);
            return (
              <div key={a.id} className="flex items-center gap-3 bg-white/5 rounded-xl px-3.5 py-2.5">
                <Avatar initials={m ? m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '--'} color={m?.color ?? '#5C53C4'} size={32} />
                <div className="flex-1 text-sm font-semibold">{m?.name ?? 'Member'}</div>
                <div className={`text-xs font-semibold ${a.on_time ? 'text-[#6FCF97]' : 'text-[#E0A458]'}`}>
                  {a.on_time ? 'On time' : 'Late'}
                </div>
              </div>
            );
          })}
          {!attendance?.length && <div className="text-sm text-white/40">No check-ins yet.</div>}
        </div>
      </div>
    </div>
  );
}
