import type { ReactNode, ButtonHTMLAttributes } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-surface border border-line rounded-2xl ${className}`}>{children}</div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  const base = 'text-center px-4 py-3 rounded-xl font-semibold text-sm transition active:scale-[0.98] disabled:opacity-50';
  const styles: Record<string, string> = {
    primary: 'bg-indigo text-white',
    secondary: 'bg-surface border border-line text-ink',
    ghost: 'bg-surface2 text-ink',
    danger: 'bg-red text-white',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition ${
        active ? 'bg-indigo text-white border-indigo' : 'bg-surface text-ink2 border-line2'
      }`}
    >
      {children}
    </button>
  );
}

export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-[46px] h-[27px] rounded-full transition shrink-0"
      style={{ background: on ? '#3F3795' : '#DED5C2' }}
    >
      <span
        className="absolute top-[3px] left-[3px] w-[21px] h-[21px] rounded-full bg-white transition-transform"
        style={{ transform: on ? 'translateX(19px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function Avatar({
  initials,
  color,
  size = 36,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between mt-6 mb-3">
      <div className="font-semibold text-base">{children}</div>
      {action}
    </div>
  );
}

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-3">
      {onBack && (
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#241F1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="flex-1 font-serif font-semibold text-2xl">{title}</div>
      {right}
    </div>
  );
}
