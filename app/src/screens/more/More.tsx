import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useChoirName } from '../../hooks/useChoir';
import { Avatar, Card } from '../../components/ui/primitives';

const TILES = [
  { to: '/more/members', label: 'Members', icon: '\u{1F465}' },
  { to: '/more/board', label: 'Noticeboard', icon: '\u{1F4CC}' },
  { to: '/more/uniform', label: 'Uniform', icon: '\u{1F455}' },
  { to: '/more/training', label: 'Vocal training', icon: '\u{1F3A4}' },
  { to: '/more/events', label: 'Special events', icon: '\u{1F31F}' },
  { to: '/more/ministration', label: 'Ministration', icon: '\u{1F64C}' },
];

export default function More() {
  const nav = useNavigate();
  const { member, signOut } = useAuth();
  const { roleLabel } = usePermissions();
  const choirName = useChoirName();

  const initials = member ? member.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '--';

  return (
    <div className="px-5 pt-6 pb-8">
      <div className="font-serif font-semibold text-2xl mb-4">More</div>

      <Card className="p-4 flex items-center gap-3.5">
        <Avatar initials={initials} color={member?.color ?? '#5C53C4'} size={44} />
        <div className="flex-1">
          <div className="font-semibold text-sm">{member?.name}</div>
          <div className="text-xs text-ink3 mt-0.5">{roleLabel} &middot; {choirName}</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {TILES.map((t) => (
          <button key={t.to} onClick={() => nav(t.to)} className="text-left">
            <Card className="p-4">
              <div className="text-2xl">{t.icon}</div>
              <div className="font-semibold text-sm mt-2">{t.label}</div>
            </Card>
          </button>
        ))}
      </div>

      <button onClick={signOut} className="mt-6 w-full text-center text-sm font-semibold text-red">
        Sign out
      </button>
    </div>
  );
}
