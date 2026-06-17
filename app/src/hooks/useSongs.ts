import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Song, SongPart } from '../types/domain';
import { useAuth } from './useAuth';

export function useSongs() {
  const { member } = useAuth();
  return useQuery({
    queryKey: ['songs', member?.choir_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('choir_id', member!.choir_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
    enabled: !!member,
  });
}

export function useSong(id: string | undefined) {
  return useQuery({
    queryKey: ['song', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('songs').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Song;
    },
    enabled: !!id,
  });
}

export function useSongParts(songId: string | undefined) {
  return useQuery({
    queryKey: ['song_parts', songId],
    queryFn: async () => {
      const { data, error } = await supabase.from('song_parts').select('*').eq('song_id', songId);
      if (error) throw error;
      return data as SongPart[];
    },
    enabled: !!songId,
  });
}

export function useCreateSong() {
  const { member } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<Song>) => {
      const { data, error } = await supabase
        .from('songs')
        .insert({ ...input, choir_id: member!.choir_id, created_by: member!.id })
        .select('*')
        .single();
      if (error) throw error;
      return data as Song;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['songs'] }),
  });
}

export function useAddSongPart(songId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; notes: string }) => {
      const { data, error } = await supabase
        .from('song_parts')
        .insert({ song_id: songId, ...input })
        .select('*')
        .single();
      if (error) throw error;
      return data as SongPart;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['song_parts', songId] }),
  });
}

export function useUploadPartAudio(songId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ partId, file }: { partId: string; file: File }) => {
      const path = `${songId}/${partId}-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('audio').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { error } = await supabase.from('song_parts').update({ audio_path: path }).eq('id', partId);
      if (error) throw error;
      return path;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['song_parts', songId] }),
  });
}

export function useSignedAudioUrls(paths: (string | null | undefined)[]) {
  const clean = paths.filter(Boolean) as string[];
  return useQuery({
    queryKey: ['signed_audio', clean.join(',')],
    queryFn: async () => {
      if (!clean.length) return {} as Record<string, string>;
      const { data, error } = await supabase.storage.from('audio').createSignedUrls(clean, 60 * 60);
      if (error) throw error;
      const map: Record<string, string> = {};
      data.forEach((d, i) => {
        if (d.signedUrl) map[clean[i]] = d.signedUrl;
      });
      return map;
    },
    enabled: clean.length > 0,
  });
}

export function useUploadReferenceAudio(songId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const path = `${songId}/reference-${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('audio').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { error } = await supabase.from('songs').update({ reference_audio_path: path }).eq('id', songId);
      if (error) throw error;
      return path;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['song', songId] }),
  });
}
