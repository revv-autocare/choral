import { supabase } from './supabase';
import type { Member } from '../types/domain';

// A signed-in auth user becomes a Choral "member" in one of two ways:
// 1) An admin already added them to the roster by email (contact) -- claim that row.
// 2) They are the first person for their choir -- create the choir and become director.

export async function claimInvitedMembership(_userId: string, email: string): Promise<Member | null> {
  const { data, error } = await supabase.rpc('claim_membership', { p_email: email });
  if (error) throw error;
  return (data as Member) ?? null;
}

export async function createChoirAsDirector(
  _userId: string,
  _email: string,
  choirName: string,
  displayName: string
): Promise<Member> {
  const { data, error } = await supabase.rpc('create_choir_as_director', {
    p_choir_name: choirName,
    p_display_name: displayName,
  });
  if (error) throw error;
  return data as Member;
}
