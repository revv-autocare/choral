export type MemberRole = 'director' | 'section_lead' | 'musician' | 'chorister';
export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';
export type AvailStatus = 'available' | 'unavailable' | 'invited';
export type ArrangementType = 'praise_worship' | 'ministration';
export type TaskStatus = 'open' | 'in_progress' | 'assigned' | 'done';
export type AudienceScope = 'everyone' | 'soprano' | 'alto' | 'tenor' | 'bass' | 'leads';

export interface Choir {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  choir_id: string;
  user_id: string | null;
  name: string;
  contact: string | null;
  part: VoicePart | null;
  role: MemberRole;
  avail: AvailStatus;
  color: string;
  active: boolean;
}

export interface Song {
  id: string;
  choir_id: string;
  title: string;
  composer: string | null;
  song_key: string | null;
  tempo: number | null;
  tags: string[];
  coming: boolean;
  lyrics: string;
  reference_audio_path: string | null;
}

export interface SongPart {
  id: string;
  song_id: string;
  name: string;
  notes: string;
  audio_path: string | null;
  led_by: string | null;
}

export interface Rehearsal {
  id: string;
  choir_id: string;
  title: string;
  place: string | null;
  starts_at: string;
}

export interface AgendaItem {
  id: string;
  rehearsal_id: string;
  position: number;
  name: string;
  owner_id: string | null;
  minutes: number;
  song_id: string | null;
}

export interface Attendance {
  id: string;
  rehearsal_id: string;
  member_id: string;
  signed_in_at: string;
  on_time: boolean;
}

export interface Arrangement {
  id: string;
  choir_id: string;
  type: ArrangementType;
  title: string;
  lead_member_id: string | null;
}

export interface ArrangementSong {
  id: string;
  arrangement_id: string;
  song_id: string;
  position: number;
}

export interface PraiseLoop {
  id: string;
  arrangement_id: string;
  name: string;
  kind: string;
  audio_path: string | null;
}

export interface ServiceDay {
  id: string;
  choir_id: string;
  service_date: string;
  call_time: string | null;
  service_time: string | null;
  pw_arrangement_id: string | null;
}

export interface ServiceDuty {
  id: string;
  service_id: string;
  duty_key: string;
  member_id: string;
}

export interface ServiceChecklistItem {
  id: string;
  service_id: string;
  label: string;
  done: boolean;
  position: number;
}

export interface Announcement {
  id: string;
  choir_id: string;
  author_id: string | null;
  title: string;
  body: string;
  audience: AudienceScope;
  pinned: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  choir_id: string;
  title: string;
  assignee_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  special_event_id: string | null;
}

export interface SpecialEvent {
  id: string;
  choir_id: string;
  title: string;
  event_date: string;
}

export interface VocalTraining {
  id: string;
  choir_id: string;
  title: string;
  category: 'breathing' | 'warm_up' | 'pitch_ear' | 'harmony';
  video_url: string | null;
  is_builtin: boolean;
}

export interface UniformLook {
  id: string;
  choir_id: string;
  name: string;
  top_color: string;
  accent_color: string;
  skin_tone: string;
  build: 'slim' | 'regular' | 'fuller';
}
