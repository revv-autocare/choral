import type { ReactNode } from 'react';

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-paper rounded-t-3xl max-h-[85vh] flex flex-col"
        style={{ animation: 'fadeUp .2s ease-out' }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-line shrink-0">
          <div className="font-serif font-semibold text-xl">{title}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface border border-line flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#241F1A" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+20px)]">{children}</div>
      </div>
    </div>
  );
}
