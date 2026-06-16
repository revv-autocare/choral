import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Member, MemberRole, VoicePart } from '../types/domain';
import { useAuth } from './useAuth';

const PALETTE = ['#3F3795', '#5C53C4', '#B0843A', '#3E7C53', '#C07A24'];

export function useMembers() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['members', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .order('name');
      if (error) throw error;
      return data as Member[];
    },
    enabled: !!member,
  });
}

export function useAddMember() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      contact: string;
      part: VoicePart;
      role: MemberRole;
      sendInvite: boolean;
    }) => {
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const { data, error } = await supabase
        .from('members')
        .insert({
          choir_id: member!.choir_id,
          name: input.name,
          contact: input.contact,
          part: input.part,
          role: input.role,
          color,
          avail: input.sendInvite ? 'invited' : 'available',
        })
        .select('*')
        .single();
      if (error) throw error;
      return data as Member;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Member> & { id: string }) => {
      const { error } = await supabase.from('members').update(patch).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}
