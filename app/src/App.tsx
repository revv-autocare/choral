import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AppShell, ImmersiveShell } from './components/layout/AppShell';
import Login from './screens/Login';
import Onboarding from './screens/Onboarding';
import Home from './screens/Home';
import SongBank from './screens/songs/SongBank';
import SongDetail from './screens/songs/SongDetail';
import AddSong from './screens/songs/AddSong';
import RehearsalsList from './screens/rehearsals/RehearsalsList';
import RehearsalDetail from './screens/rehearsals/RehearsalDetail';
import QrAttendance from './screens/rehearsals/QrAttendance';
import LiveRehearsal from './screens/rehearsals/LiveRehearsal';
import Service from './screens/service/Service';
import PraiseWorship from './screens/pw/PraiseWorship';
import More from './screens/more/More';
import Members from './screens/more/Members';
import Noticeboard from './screens/more/Noticeboard';
import Uniform from './screens/more/Uniform';
import Ministration from './screens/more/Ministration';
import Events from './screens/more/Events';
import VocalTraining from './screens/more/VocalTraining';

function Gate({ children }: { children: React.ReactNode }) {
  const { session, member, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-paper text-ink2">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (!member) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route
          element={
            <Gate>
              <AppShell />
            </Gate>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/songs" element={<SongBank />} />
          <Route path="/songs/new" element={<AddSong />} />
          <Route path="/songs/:id" element={<SongDetail />} />
          <Route path="/rehearsals" element={<RehearsalsList />} />
          <Route path="/rehearsals/:id" element={<RehearsalDetail />} />
          <Route path="/service" element={<Service />} />
          <Route path="/pw/:id" element={<PraiseWorship />} />
          <Route path="/more" element={<More />} />
          <Route path="/more/members" element={<Members />} />
          <Route path="/more/board" element={<Noticeboard />} />
          <Route path="/more/uniform" element={<Uniform />} />
          <Route path="/more/ministration" element={<Ministration />} />
          <Route path="/more/ministration/:id" element={<PraiseWorship />} />
          <Route path="/more/events" element={<Events />} />
          <Route path="/more/training" element={<VocalTraining />} />
        </Route>

        <Route
          element={
            <Gate>
              <ImmersiveShell />
            </Gate>
          }
        >
          <Route path="/rehearsals/:id/qr" element={<QrAttendance />} />
          <Route path="/rehearsals/:id/live" element={<LiveRehearsal />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
