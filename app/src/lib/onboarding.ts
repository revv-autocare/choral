import { supabase } from './supabase';
import type { Member } from '../types/domain';

// A signed-in auth user becomes a Choral "member" in one of two ways:
// 1) An admin already added them to the roster by email (contact) -- claim that row.
// 2) They are the first person for their choir -- create the choir and become director.

export async function claimInvitedMembership(userId: string, email: string): Promise<Member | null> {
  const { data: candidate } = await supabase
    .from('members')
    .select('*')
    .is('user_id', null)
    .ilike('contact', email)
    .limit(1)
    .maybeSingle();

  if (!candidate) return null;

  const { data, error } = await supabase
    .from('members')
    .update({ user_id: userId, avail: 'available' })
    .eq('id', candidate.id)
    .select('*')
    .single();

  if (error) throw error;
  return data as Member;
}

export async function createChoirAsDirector(
  userId: string,
  email: string,
  choirName: string,
  displayName: string
): Promise<Member> {
  const { data: choir, error: choirErr } = await supabase
    .from('choirs')
    .insert({ name: choirName })
    .select('*')
    .single();
  if (choirErr) throw choirErr;

  const { data: member, error: memberErr } = await supabase
    .from('members')
    .insert({
      choir_id: choir.id,
      user_id: userId,
      name: displayName,
      contact: email,
      role: 'director',
      avail: 'available',
      color: '#3F3795',
    })
    .select('*')
    .single();
  if (memberErr) throw memberErr;
  return member as Member;
}
