import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useChoirName() {
  const { member } = useAuth();
  const { data } = useQuery({
    queryKey: ['choir', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase.from('choirs').select('name').eq('id', member!.choir_id).single();
      if (error) throw error;
      return data.name as string;
    },
    enabled: !!member,
  });
  return data ?? '';
}
