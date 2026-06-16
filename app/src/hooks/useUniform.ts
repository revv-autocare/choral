import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { UniformLook } from '../types/domain';
import { useAuth } from './useAuth';

export function useUniformLooks() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['uniform_looks', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uniform_looks')
        .select('*, uniform_votes(count)')
        .eq('choir_id', member!.choir_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({ ...row, voteCount: row.uniform_votes?.[0]?.count ?? 0 })) as (UniformLook & {
        voteCount: number;
      })[];
    },
    enabled: !!member,
  });
}

export function useSaveLook() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<UniformLook, 'id' | 'choir_id'>) => {
      const { data, error } = await supabase
        .from('uniform_looks')
        .insert({ ...input, choir_id: member!.choir_id, created_by: member!.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as UniformLook;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uniform_looks'] }),
  });
}

export function useVoteLook() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lookId: string) => {
      const { error } = await supabase.from('uniform_votes').upsert({ look_id: lookId, member_id: member!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['uniform_looks'] }),
  });
}
