import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ServiceChecklistItem, ServiceDay, ServiceDuty } from '../types/domain';
import { useAuth } from './useAuth';

export function useNextService() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['next_service', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .gte('service_date', new Date().toISOString().slice(0, 10))
        .order('service_date')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ServiceDay | null;
    },
    enabled: !!member,
  });
}

export function useServiceDuties(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service_duties', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase.from('service_duties').select('*').eq('service_id', serviceId);
      if (error) throw error;
      return data as ServiceDuty[];
    },
    enabled: !!serviceId,
  });
}

export function useServiceChecklist(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service_checklist', serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_checklist_items')
        .select('*')
        .eq('service_id', serviceId)
        .order('position');
      if (error) throw error;
      return data as ServiceChecklistItem[];
    },
    enabled: !!serviceId,
  });
}

export function useToggleChecklistItem(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from('service_checklist_items').update({ done }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service_checklist', serviceId] }),
  });
}

export function useAssignDuty(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dutyKey, memberId }: { dutyKey: string; memberId: string }) => {
      const { error } = await supabase.from('service_duties').insert({ service_id: serviceId, duty_key: dutyKey, member_id: memberId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service_duties', serviceId] }),
  });
}
