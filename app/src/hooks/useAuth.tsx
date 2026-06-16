import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Member } from '../types/domain';

interface AuthState {
  session: Session | null;
  member: Member | null;
  loading: boolean;
  refreshMember: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

async function fetchMember(userId: string): Promise<Member | null> {
  const { data } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .limit(1)
    .maybeSingle();
  return (data as Member) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshMember() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setMember(await fetchMember(data.session.user.id));
    } else {
      setMember(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) setMember(await fetchMember(data.session.user.id));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        setMember(await fetchMember(newSession.user.id));
      } else {
        setMember(null);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, member, loading, refreshMember, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
