-- Choral schema. Multi-tenant from day one: every choir-owned row carries choir_id.
-- Roles cascade: director (admin) > section_lead > musician > chorister.

create extension if not exists "pgcrypto";

create type member_role as enum ('director', 'section_lead', 'musician', 'chorister');
create type voice_part as enum ('soprano', 'alto', 'tenor', 'bass');
create type avail_status as enum ('available', 'unavailable', 'invited');
create type arrangement_type as enum ('praise_worship', 'ministration');
create type task_status as enum ('open', 'in_progress', 'assigned', 'done');
create type audience_scope as enum ('everyone', 'soprano', 'alto', 'tenor', 'bass', 'leads');

create table choirs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One row per (auth user, choir) membership -- a user can belong to multiple choirs later.
create table members (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  contact text,
  part voice_part,
  role member_role not null default 'chorister',
  avail avail_status not null default 'available',
  color text not null default '#3F3795',
  active boolean not null default true,
  invited_at timestamptz,
  created_at timestamptz not null default now()
);
create index members_choir_idx on members(choir_id);
create index members_user_idx on members(user_id);

create table songs (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  title text not null,
  composer text,
  song_key text,
  tempo int,
  tags text[] not null default '{}',
  coming boolean not null default false,
  lyrics text default '',
  reference_audio_path text,
  created_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index songs_choir_idx on songs(choir_id);

create table song_parts (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references songs(id) on delete cascade,
  name text not null,
  notes text default '',
  audio_path text,
  led_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index song_parts_song_idx on song_parts(song_id);

create table song_progress (
  song_id uuid not null references songs(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  pct numeric not null default 0,
  updated_at timestamptz not null default now(),
  primary key (song_id, member_id)
);

create table rehearsals (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  title text not null,
  place text,
  starts_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index rehearsals_choir_idx on rehearsals(choir_id);

create table agenda_items (
  id uuid primary key default gen_random_uuid(),
  rehearsal_id uuid not null references rehearsals(id) on delete cascade,
  position int not null,
  name text not null,
  owner_id uuid references members(id) on delete set null,
  minutes int not null default 5,
  song_id uuid references songs(id) on delete set null
);
create index agenda_items_rehearsal_idx on agenda_items(rehearsal_id);

create table attendance_tokens (
  id uuid primary key default gen_random_uuid(),
  rehearsal_id uuid not null references rehearsals(id) on delete cascade,
  token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index attendance_tokens_rehearsal_idx on attendance_tokens(rehearsal_id);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  rehearsal_id uuid not null references rehearsals(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  signed_in_at timestamptz not null default now(),
  on_time boolean not null default true,
  unique (rehearsal_id, member_id)
);
create index attendance_rehearsal_idx on attendance(rehearsal_id);

create table arrangements (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  type arrangement_type not null,
  title text not null,
  lead_member_id uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);
create index arrangements_choir_idx on arrangements(choir_id);

create table arrangement_songs (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references arrangements(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  position int not null
);
create index arrangement_songs_arr_idx on arrangement_songs(arrangement_id);

create table praise_loops (
  id uuid primary key default gen_random_uuid(),
  arrangement_id uuid not null references arrangements(id) on delete cascade,
  name text not null,
  kind text not null default 'vamp',
  audio_path text
);

create table services (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  service_date date not null,
  call_time time,
  service_time time,
  pw_arrangement_id uuid references arrangements(id) on delete set null,
  created_at timestamptz not null default now()
);
create index services_choir_idx on services(choir_id);

create table service_duties (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  duty_key text not null, -- 'lead' | 'backup' | 'keys' | 'drums' | ...
  member_id uuid not null references members(id) on delete cascade
);
create index service_duties_service_idx on service_duties(service_id);

create table service_checklist_items (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references services(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  position int not null default 0
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  author_id uuid references members(id) on delete set null,
  title text not null,
  body text not null,
  audience audience_scope not null default 'everyone',
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create index announcements_choir_idx on announcements(choir_id);

create table announcement_likes (
  announcement_id uuid not null references announcements(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  primary key (announcement_id, member_id)
);

create table announcement_comments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references announcements(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  title text not null,
  assignee_id uuid references members(id) on delete set null,
  due_date date,
  status task_status not null default 'open',
  special_event_id uuid,
  created_at timestamptz not null default now()
);
create index tasks_choir_idx on tasks(choir_id);
create index tasks_assignee_idx on tasks(assignee_id);

create table special_events (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  title text not null,
  event_date date not null,
  created_at timestamptz not null default now()
);
alter table tasks add constraint tasks_special_event_fk
  foreign key (special_event_id) references special_events(id) on delete cascade;

create table vocal_trainings (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  title text not null,
  category text not null default 'warm_up', -- breathing | warm_up | pitch_ear | harmony
  video_url text,
  is_builtin boolean not null default false,
  created_at timestamptz not null default now()
);

create table training_completions (
  training_id uuid not null references vocal_trainings(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (training_id, member_id)
);

create table uniform_looks (
  id uuid primary key default gen_random_uuid(),
  choir_id uuid not null references choirs(id) on delete cascade,
  name text not null,
  top_color text not null,
  accent_color text not null,
  skin_tone text not null,
  build text not null default 'regular',
  created_by uuid references members(id) on delete set null,
  created_at timestamptz not null default now()
);

create table uniform_votes (
  look_id uuid not null references uniform_looks(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  primary key (look_id, member_id)
);

-- ---------- Row Level Security ----------
-- Helper: the member row(s) for the current auth user.
create or replace function current_member_choir_ids() returns setof uuid as $$
  select choir_id from members where user_id = auth.uid() and active = true;
$$ language sql stable security definer;

create or replace function current_member_role(p_choir_id uuid) returns member_role as $$
  select role from members where user_id = auth.uid() and choir_id = p_choir_id and active = true limit 1;
$$ language sql stable security definer;

create or replace function is_choir_admin(p_choir_id uuid) returns boolean as $$
  select current_member_role(p_choir_id) = 'director';
$$ language sql stable security definer;

create or replace function is_choir_lead_or_above(p_choir_id uuid) returns boolean as $$
  select current_member_role(p_choir_id) in ('director', 'section_lead');
$$ language sql stable security definer;

alter table choirs enable row level security;
alter table members enable row level security;
alter table songs enable row level security;
alter table song_parts enable row level security;
alter table song_progress enable row level security;
alter table rehearsals enable row level security;
alter table agenda_items enable row level security;
alter table attendance_tokens enable row level security;
alter table attendance enable row level security;
alter table arrangements enable row level security;
alter table arrangement_songs enable row level security;
alter table praise_loops enable row level security;
alter table services enable row level security;
alter table service_duties enable row level security;
alter table service_checklist_items enable row level security;
alter table announcements enable row level security;
alter table announcement_likes enable row level security;
alter table announcement_comments enable row level security;
alter table tasks enable row level security;
alter table special_events enable row level security;
alter table vocal_trainings enable row level security;
alter table training_completions enable row level security;
alter table uniform_looks enable row level security;
alter table uniform_votes enable row level security;

create policy choirs_select on choirs for select using (id in (select current_member_choir_ids()));

create policy members_select on members for select using (choir_id in (select current_member_choir_ids()));
create policy members_write_admin on members for insert with check (is_choir_lead_or_above(choir_id));
create policy members_update_admin on members for update using (is_choir_lead_or_above(choir_id));

-- Generic pattern: anyone in the choir can read; only leads+ can write.
create policy songs_select on songs for select using (choir_id in (select current_member_choir_ids()));
create policy songs_write on songs for insert with check (is_choir_lead_or_above(choir_id));
create policy songs_update on songs for update using (is_choir_lead_or_above(choir_id));

create policy song_parts_select on song_parts for select using (
  song_id in (select id from songs where choir_id in (select current_member_choir_ids())));
create policy song_parts_write on song_parts for all using (
  song_id in (select id from songs where is_choir_lead_or_above(choir_id)));

create policy song_progress_rw on song_progress for all using (
  member_id in (select id from members where user_id = auth.uid()));

create policy rehearsals_select on rehearsals for select using (choir_id in (select current_member_choir_ids()));
create policy rehearsals_write on rehearsals for all using (is_choir_lead_or_above(choir_id));

create policy agenda_items_select on agenda_items for select using (
  rehearsal_id in (select id from rehearsals where choir_id in (select current_member_choir_ids())));
create policy agenda_items_write on agenda_items for all using (
  rehearsal_id in (select id from rehearsals where is_choir_lead_or_above(choir_id)));

create policy attendance_tokens_select on attendance_tokens for select using (
  rehearsal_id in (select id from rehearsals where choir_id in (select current_member_choir_ids())));
create policy attendance_tokens_write on attendance_tokens for all using (
  rehearsal_id in (select id from rehearsals where is_choir_lead_or_above(choir_id)));

create policy attendance_select on attendance for select using (
  rehearsal_id in (select id from rehearsals where choir_id in (select current_member_choir_ids())));
create policy attendance_insert_self on attendance for insert with check (
  member_id in (select id from members where user_id = auth.uid()));

create policy arrangements_select on arrangements for select using (choir_id in (select current_member_choir_ids()));
create policy arrangements_write on arrangements for all using (is_choir_lead_or_above(choir_id));

create policy arrangement_songs_select on arrangement_songs for select using (
  arrangement_id in (select id from arrangements where choir_id in (select current_member_choir_ids())));
create policy arrangement_songs_write on arrangement_songs for all using (
  arrangement_id in (select id from arrangements where is_choir_lead_or_above(choir_id)));

create policy praise_loops_select on praise_loops for select using (
  arrangement_id in (select id from arrangements where choir_id in (select current_member_choir_ids())));
create policy praise_loops_write on praise_loops for all using (
  arrangement_id in (select id from arrangements where is_choir_lead_or_above(choir_id)));

create policy services_select on services for select using (choir_id in (select current_member_choir_ids()));
create policy services_write on services for all using (is_choir_lead_or_above(choir_id));

create policy service_duties_select on service_duties for select using (
  service_id in (select id from services where choir_id in (select current_member_choir_ids())));
create policy service_duties_write on service_duties for all using (
  service_id in (select id from services where is_choir_lead_or_above(choir_id)));

create policy service_checklist_select on service_checklist_items for select using (
  service_id in (select id from services where choir_id in (select current_member_choir_ids())));
create policy service_checklist_write on service_checklist_items for all using (
  service_id in (select id from services where choir_id in (select current_member_choir_ids())));

create policy announcements_select on announcements for select using (choir_id in (select current_member_choir_ids()));
create policy announcements_write on announcements for all using (is_choir_lead_or_above(choir_id));

create policy announcement_likes_rw on announcement_likes for all using (
  member_id in (select id from members where user_id = auth.uid()));
create policy announcement_likes_select on announcement_likes for select using (
  announcement_id in (select id from announcements where choir_id in (select current_member_choir_ids())));

create policy announcement_comments_select on announcement_comments for select using (
  announcement_id in (select id from announcements where choir_id in (select current_member_choir_ids())));
create policy announcement_comments_insert on announcement_comments for insert with check (
  member_id in (select id from members where user_id = auth.uid()));

create policy tasks_select on tasks for select using (choir_id in (select current_member_choir_ids()));
create policy tasks_write on tasks for all using (is_choir_lead_or_above(choir_id));

create policy special_events_select on special_events for select using (choir_id in (select current_member_choir_ids()));
create policy special_events_write on special_events for all using (is_choir_lead_or_above(choir_id));

create policy vocal_trainings_select on vocal_trainings for select using (choir_id in (select current_member_choir_ids()));
create policy vocal_trainings_write on vocal_trainings for all using (is_choir_lead_or_above(choir_id));

create policy training_completions_rw on training_completions for all using (
  member_id in (select id from members where user_id = auth.uid()));

create policy uniform_looks_select on uniform_looks for select using (choir_id in (select current_member_choir_ids()));
create policy uniform_looks_write on uniform_looks for all using (choir_id in (select current_member_choir_ids()));

create policy uniform_votes_rw on uniform_votes for all using (
  member_id in (select id from members where user_id = auth.uid()));
create policy uniform_votes_select on uniform_votes for select using (
  look_id in (select id from uniform_looks where choir_id in (select current_member_choir_ids())));

-- Storage buckets for audio (reference recordings, part stems, praise loops).
insert into storage.buckets (id, name, public) values ('audio', 'audio', false)
  on conflict (id) do nothing;
