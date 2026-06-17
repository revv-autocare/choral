import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/primitives';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp;
      const { error } = await fn({ email, password });
      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <svg viewBox="0 0 30 30" width="38" height="38" fill="none">
            <rect x="11" y="0" width="8" height="8" rx="1.2" transform="rotate(45 15 4)" fill="#3F3795" />
            <rect x="0" y="11" width="8" height="8" rx="1.2" transform="rotate(45 4 15)" fill="#5C53C4" />
            <rect x="22" y="11" width="8" height="8" rx="1.2" transform="rotate(45 26 15)" fill="#B0843A" />
            <rect x="11" y="22" width="8" height="8" rx="1.2" transform="rotate(45 15 26)" fill="#5C53C4" />
          </svg>
          <div className="font-serif text-3xl font-semibold">Choral</div>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-line2 rounded-xl px-4 py-3 text-sm font-medium bg-surface"
          />
          {error && <div className="text-red text-sm font-medium">{error}</div>}
          <Button type="submit" disabled={busy}>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        <button
          className="mt-4 text-sm font-semibold text-indigo block mx-auto"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? "New here? Create an account" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
}
