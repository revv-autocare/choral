import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Arrangement, ArrangementType, PraiseLoop, Song } from '../types/domain';
import { useAuth } from './useAuth';

export function useArrangements(type: ArrangementType) {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['arrangements', type, member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('arrangements')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .eq('type', type)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Arrangement[];
    },
    enabled: !!member,
  });
}

export function useArrangement(id: string | undefined) {
  return useQuery({
    queryKey: ['arrangement', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('arrangements').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Arrangement;
    },
    enabled: !!id,
  });
}

export function useArrangementSongs(arrangementId: string | undefined) {
  return useQuery({
    queryKey: ['arrangement_songs', arrangementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('arrangement_songs')
        .select('position, songs(*)')
        .eq('arrangement_id', arrangementId)
        .order('position');
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ position: r.position, song: r.songs as Song }));
    },
    enabled: !!arrangementId,
  });
}

export function usePraiseLoops(arrangementId: string | undefined) {
  return useQuery({
    queryKey: ['praise_loops', arrangementId],
    queryFn: async () => {
      const { data, error } = await supabase.from('praise_loops').select('*').eq('arrangement_id', arrangementId);
      if (error) throw error;
      return data as PraiseLoop[];
    },
    enabled: !!arrangementId,
  });
}

export function useCreateArrangement(type: ArrangementType) {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('arrangements')
        .insert({ choir_id: member!.choir_id, type, title })
        .select('*')
        .single();
      if (error) throw error;
      return data as Arrangement;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['arrangements', type] }),
  });
}

export function useSetArrangementLead(arrangementId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('arrangements')
        .update({ lead_member_id: memberId })
        .eq('id', arrangementId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['arrangement', arrangementId] }),
  });
}
