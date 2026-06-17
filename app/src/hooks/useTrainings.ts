import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { VocalTraining } from '../types/domain';
import { useAuth } from './useAuth';

export function useVocalTrainings() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['vocal_trainings', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vocal_trainings')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .order('is_builtin', { ascending: false });
      if (error) throw error;
      return data as VocalTraining[];
    },
    enabled: !!member,
  });
}

export function useMyCompletedTrainings() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['training_completions', member?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_completions')
        .select('training_id')
        .eq('member_id', member!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.training_id));
    },
    enabled: !!member,
  });
}

export function useMarkTrainingComplete() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (trainingId: string) => {
      const { error } = await supabase.from('training_completions').upsert({ training_id: trainingId, member_id: member!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['training_completions'] }),
  });
}
