import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ServiceChecklistItem, ServiceDay, ServiceDuty } from '../types/domain';
import { useAuth } from './useAuth';

export function useCreateService() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { service_date: string; call_time: string | null; service_time: string | null }) => {
      const { data, error } = await supabase
        .from('services')
        .insert({ choir_id: member!.choir_id, ...input })
        .select('*')
        .single();
      if (error) throw error;
      return data as ServiceDay;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['next_service'] }),
  });
}

export function useUpdateService(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ServiceDay>) => {
      const { error } = await supabase.from('services').update(patch).eq('id', serviceId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['next_service'] }),
  });
}

export function useAddChecklistItem(serviceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { label: string; position: number }) => {
      const { error } = await supabase
        .from('service_checklist_items')
        .insert({ service_id: serviceId, label: input.label, position: input.position });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service_checklist', serviceId] }),
  });
}

// Adds a song to the service's praise-set, creating + linking an arrangement on first use.
export function useAddServiceSong(service: ServiceDay | null | undefined) {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { songId: string; position: number }) => {
      if (!service) throw new Error('No service');
      let arrId = service.pw_arrangement_id;
      if (!arrId) {
        const { data: arr, error: aErr } = await supabase
          .from('arrangements')
          .insert({ choir_id: member!.choir_id, type: 'praise_worship', title: 'Service set' })
          .select('id')
          .single();
        if (aErr) throw aErr;
        arrId = arr.id as string;
        const { error: uErr } = await supabase.from('services').update({ pw_arrangement_id: arrId }).eq('id', service.id);
        if (uErr) throw uErr;
      }
      const { error } = await supabase
        .from('arrangement_songs')
        .insert({ arrangement_id: arrId, song_id: input.songId, position: input.position });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['next_service'] });
      qc.invalidateQueries({ queryKey: ['arrangement_songs'] });
    },
  });
}

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
