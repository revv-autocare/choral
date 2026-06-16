import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const stroke = (active: boolean) => (active ? '#3F3795' : '#9A9183');

const tabs: Tab[] = [
  {
    to: '/',
    label: 'Home',
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9.5a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
      </svg>
    ),
  },
  {
    to: '/songs',
    label: 'Songs',
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" />
      </svg>
    ),
  },
  {
    to: '/rehearsals',
    label: 'Rehearse',
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
  {
    to: '/service',
    label: 'Service',
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l2 2 4-4" /><rect x="3" y="4" width="18" height="17" rx="2.5" />
      </svg>
    ),
  },
  {
    to: '/more',
    label: 'More',
    icon: (a) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
      </svg>
    ),
  },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-line bg-surface/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="flex">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                {t.icon(isActive)}
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: isActive ? '#3F3795' : '#9A9183' }}
                >
                  {t.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
