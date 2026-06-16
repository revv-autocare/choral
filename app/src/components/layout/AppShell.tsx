import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-md min-h-screen bg-paper pb-20">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

export function ImmersiveShell() {
  return (
    <div className="min-h-screen bg-dark">
      <div className="mx-auto max-w-md min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}
