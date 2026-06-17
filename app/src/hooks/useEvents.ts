import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { SpecialEvent, Task } from '../types/domain';
import { useAuth } from './useAuth';

export function useSpecialEvents() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['special_events', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('special_events')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .order('event_date');
      if (error) throw error;
      return data as SpecialEvent[];
    },
    enabled: !!member,
  });
}

export function useCreateEvent() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; event_date: string }) => {
      const { data, error } = await supabase
        .from('special_events')
        .insert({ choir_id: member!.choir_id, title: input.title, event_date: input.event_date })
        .select('*')
        .single();
      if (error) throw error;
      return data as SpecialEvent;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['special_events'] }),
  });
}

export function useTasksForEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*').eq('special_event_id', eventId);
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!eventId,
  });
}

export function useMyTasks() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['tasks', 'mine', member?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', member!.id)
        .neq('status', 'done')
        .order('due_date');
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!member,
  });
}

export function useCreateTask() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; due_date?: string | null; assignee_id?: string | null; special_event_id?: string | null }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...input, choir_id: member!.choir_id, status: input.assignee_id ? 'assigned' : 'open' })
        .select('*')
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, assignee_id }: { id: string; assignee_id: string }) => {
      const { error } = await supabase.from('tasks').update({ assignee_id, status: 'assigned' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
