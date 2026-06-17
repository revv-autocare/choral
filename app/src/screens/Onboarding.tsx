import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { claimInvitedMembership, createChoirAsDirector } from '../lib/onboarding';
import { Button } from '../components/ui/primitives';

export default function Onboarding() {
  const { session, member, refreshMember } = useAuth();
  const [mode, setMode] = useState<'choose' | 'create'>('choose');
  const [checking, setChecking] = useState(false);
  const [choirName, setChoirName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!session) return <Navigate to="/login" replace />;
  if (member) return <Navigate to="/" replace />;
  const email = session.user.email ?? '';

  async function tryClaim() {
    setChecking(true);
    setError(null);
    try {
      const member = await claimInvitedMembership(session!.user.id, email);
      if (member) {
        await refreshMember();
      } else {
        setError(`No invite found for ${email} yet. Ask your director to add you, or create a new choir below.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setChecking(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createChoirAsDirector(session!.user.id, email, choirName, displayName);
      await refreshMember();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="font-serif text-2xl font-semibold mb-2">Welcome to Choral</div>
        <div className="text-ink2 text-sm mb-6">Signed in as {email}</div>

        {mode === 'choose' && (
          <div className="flex flex-col gap-3">
            <Button onClick={tryClaim} disabled={checking}>
              I was invited by my choir
            </Button>
            <Button variant="secondary" onClick={() => setMode('create')}>
              Start a new choir
            </Button>
            {error && <div className="text-red text-sm font-medium mt-1">{error}</div>}
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={create} className="flex flex-col gap-3">
            <input
              required
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface"
            />
            <input
              required
              placeholder="Choir name"
              value={choirName}
              onChange={(e) => setChoirName(e.target.value)}
              className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface"
            />
            {error && <div className="text-red text-sm font-medium">{error}</div>}
            <Button type="submit">Create choir &amp; become director</Button>
            <button type="button" className="text-sm font-semibold text-ink2" onClick={() => setMode('choose')}>
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
