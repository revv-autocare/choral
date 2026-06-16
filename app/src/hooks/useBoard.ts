import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Announcement, AudienceScope } from '../types/domain';
import { useAuth } from './useAuth';

export function useAnnouncements() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['announcements', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*, likes:announcement_likes(count), comments:announcement_comments(count)')
        .eq('choir_id', member!.choir_id)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        likeCount: row.likes?.[0]?.count ?? 0,
        commentCount: row.comments?.[0]?.count ?? 0,
      })) as (Announcement & { likeCount: number; commentCount: number })[];
    },
    enabled: !!member,
  });
}

export function usePublishAnnouncement() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; body: string; audience: AudienceScope; pinned: boolean }) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert({ ...input, choir_id: member!.choir_id, author_id: member!.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as Announcement;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useLikeAnnouncement() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase
        .from('announcement_likes')
        .upsert({ announcement_id: announcementId, member_id: member!.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}
