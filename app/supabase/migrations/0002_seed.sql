-- Demo content for "Heavenly Voices" so the app isn't empty on first run.
-- Member rows here have no user_id yet -- they get linked when someone signs up
-- with a matching invite (see app/src/lib/onboarding.ts), or an admin can
-- relink them by email from the Members admin screen.

insert into choirs (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Heavenly Voices');

insert into members (choir_id, name, part, role, avail, color) values
  ('00000000-0000-0000-0000-000000000001', 'Adaeze Okafor', 'soprano', 'director', 'available', '#3F3795'),
  ('00000000-0000-0000-0000-000000000001', 'Tinuke Adeyemi', 'soprano', 'section_lead', 'available', '#5C53C4'),
  ('00000000-0000-0000-0000-000000000001', 'Funmi Bello', 'alto', 'section_lead', 'available', '#B0843A'),
  ('00000000-0000-0000-0000-000000000001', 'Chidi Eze', 'tenor', 'section_lead', 'available', '#3E7C53'),
  ('00000000-0000-0000-0000-000000000001', 'Emeka Obi', 'bass', 'section_lead', 'unavailable', '#C07A24'),
  ('00000000-0000-0000-0000-000000000001', 'Bukky Salami', 'soprano', 'musician', 'available', '#3F3795'),
  ('00000000-0000-0000-0000-000000000001', 'Ngozi Umeh', 'alto', 'chorister', 'available', '#B0843A'),
  ('00000000-0000-0000-0000-000000000001', 'Seun Bakare', 'tenor', 'chorister', 'available', '#3E7C53'),
  ('00000000-0000-0000-0000-000000000001', 'David Okon', 'bass', 'chorister', 'available', '#C07A24'),
  ('00000000-0000-0000-0000-000000000001', 'Amaka Nwosu', 'alto', 'chorister', 'unavailable', '#B0843A');

insert into songs (id, choir_id, title, composer, song_key, tempo, tags, coming, lyrics) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Healer of Hearts', 'T. Adeyemi', 'F', 72, '{Slow,Worship,English}', true,
   E'Healer of hearts, You are my song\nIn every valley, You lead me on\nThough the night is long\nYour mercy carries me home'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Joy Unending', 'C. Eze', 'Ab', 128, '{Fast,Praise,English}', true,
   E'Joy unending fills my soul\nEvery worry, He makes whole\nDance before Him, lift your voice\nIn His presence we rejoice'),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Mighty is Your Name', 'F. Bello', 'D', 96, '{Mid,Worship,English}', true,
   E'Mighty is Your name, O Lord\nHeaven and earth declare Your word\nNo other can compare\nMighty God, You reign'),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 'Ile Ayo', 'Trad. arr. Bakare', 'G', 110, '{Mid,Praise,Yoruba}', false,
   E'Ile ayo ni temi o\nInu mi yo nitori e\nOluwa, o se o\nIfe re ko ni dopin'),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 'Standing on the Rock', 'A. Okafor', 'C', 84, '{Slow,Hymn,English}', false,
   E'On the rock of ages I stand\nGuided by Your steady hand\nStorms may come and waters rise\nStill my anchor holds the skies');

insert into song_parts (song_id, name, notes) values
  ('00000000-0000-0000-0000-000000000101', 'Soprano', 'Watch the entry on the bridge -- come in soft.'),
  ('00000000-0000-0000-0000-000000000101', 'Alto', 'Hold the harmony under the soprano line in verse 2.'),
  ('00000000-0000-0000-0000-000000000101', 'Tenor', ''),
  ('00000000-0000-0000-0000-000000000101', 'Bass', 'Root notes only until the chorus.'),
  ('00000000-0000-0000-0000-000000000102', 'Soprano', ''),
  ('00000000-0000-0000-0000-000000000102', 'Alto', ''),
  ('00000000-0000-0000-0000-000000000102', 'Tenor', 'Sing the call-and-response with the lead.'),
  ('00000000-0000-0000-0000-000000000102', 'Bass', '');

insert into rehearsals (id, choir_id, title, place, starts_at) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', 'Sunday Prep', 'Main Hall', now() + interval '6 hours'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', 'Midweek Run-through', 'Choir Room', now() - interval '4 days');

insert into agenda_items (rehearsal_id, position, name, minutes, song_id) values
  ('00000000-0000-0000-0000-000000000201', 1, 'Warm-up', 10, null),
  ('00000000-0000-0000-0000-000000000201', 2, 'Healer of Hearts -- run-through', 15, '00000000-0000-0000-0000-000000000101'),
  ('00000000-0000-0000-0000-000000000201', 3, 'Joy Unending -- alto sectional', 15, '00000000-0000-0000-0000-000000000102'),
  ('00000000-0000-0000-0000-000000000201', 4, 'P&W block run', 20, null),
  ('00000000-0000-0000-0000-000000000201', 5, 'Announcements', 5, null);

insert into arrangements (id, choir_id, type, title) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', 'praise_worship', 'Sunday Praise Set');

insert into arrangement_songs (arrangement_id, song_id, position) values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000102', 1),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000104', 2);

insert into praise_loops (arrangement_id, name, kind) values
  ('00000000-0000-0000-0000-000000000301', 'Closing vamp', 'vamp'),
  ('00000000-0000-0000-0000-000000000301', 'Turnaround in D', 'turnaround');

insert into services (id, choir_id, service_date, call_time, service_time, pw_arrangement_id) values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', current_date + 1, '08:00', '09:30', '00000000-0000-0000-0000-000000000301');

insert into service_checklist_items (service_id, label, position) values
  ('00000000-0000-0000-0000-000000000401', 'Confirm mic count with sound team', 1),
  ('00000000-0000-0000-0000-000000000401', 'Print song order for the booth', 2),
  ('00000000-0000-0000-0000-000000000401', 'Charge in-ear packs', 3);

insert into announcements (choir_id, title, body, audience, pinned) values
  ('00000000-0000-0000-0000-000000000001', 'New rehearsal time', 'Starting next week, Sunday Prep moves to 5pm so we finish before evening service.', 'everyone', true),
  ('00000000-0000-0000-0000-000000000001', 'Alto sectional Thursday', 'Bring your part notes for Joy Unending -- we are tightening the harmony before Sunday.', 'alto', false);

insert into vocal_trainings (choir_id, title, category, is_builtin) values
  ('00000000-0000-0000-0000-000000000001', 'Diaphragm breathing basics', 'breathing', true),
  ('00000000-0000-0000-0000-000000000001', 'Five-minute warm-up ladder', 'warm_up', true),
  ('00000000-0000-0000-0000-000000000001', 'Pitch matching drills', 'pitch_ear', true),
  ('00000000-0000-0000-0000-000000000001', 'Three-part harmony basics', 'harmony', true);

insert into special_events (id, choir_id, title, event_date) values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000001', 'Christmas Carol Service', current_date + 30);
