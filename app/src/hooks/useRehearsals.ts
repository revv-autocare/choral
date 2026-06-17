import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { AgendaItem, Attendance, Rehearsal } from '../types/domain';
import { useAuth } from './useAuth';

export function useRehearsals() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['rehearsals', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rehearsals')
        .select('*, attendance(count)')
        .eq('choir_id', member!.choir_id)
        .order('starts_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ ...r, attendanceCount: r.attendance?.[0]?.count ?? 0 })) as (Rehearsal & {
        attendanceCount: number;
      })[];
    },
    enabled: !!member,
  });
}

export function useNextRehearsal() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['next_rehearsal', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rehearsals')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Rehearsal | null;
    },
    enabled: !!member,
  });
}

export function useRehearsal(id: string | undefined) {
  return useQuery({
    queryKey: ['rehearsal', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('rehearsals').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Rehearsal;
    },
    enabled: !!id,
  });
}

export function useAgenda(rehearsalId: string | undefined) {
  return useQuery({
    queryKey: ['agenda', rehearsalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agenda_items')
        .select('*')
        .eq('rehearsal_id', rehearsalId)
        .order('position');
      if (error) throw error;
      return data as AgendaItem[];
    },
    enabled: !!rehearsalId,
  });
}

export function useAttendance(rehearsalId: string | undefined) {
  return useQuery({
    queryKey: ['attendance', rehearsalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('rehearsal_id', rehearsalId)
        .order('signed_in_at', { ascending: false });
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!rehearsalId,
    refetchInterval: 4000,
  });
}

function randomToken(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function useAttendanceToken(rehearsalId: string | undefined) {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['attendance_token', rehearsalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_tokens')
        .select('*')
        .eq('rehearsal_id', rehearsalId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!rehearsalId,
    refetchInterval: 5000,
  });

  const rotate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('attendance_tokens')
        .insert({
          rehearsal_id: rehearsalId,
          token: randomToken(),
          expires_at: new Date(Date.now() + 30_000).toISOString(),
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance_token', rehearsalId] }),
  });

  return { ...query, rotate };
}

export function useSignIn(rehearsalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, onTime }: { memberId: string; onTime: boolean }) => {
      const { error } = await supabase
        .from('attendance')
        .upsert({ rehearsal_id: rehearsalId, member_id: memberId, on_time: onTime });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance', rehearsalId] }),
  });
}
