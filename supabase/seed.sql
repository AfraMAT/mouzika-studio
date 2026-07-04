-- Seed reference content for Mouzika Studio (courses, achievements, content-engine demo).
-- Idempotent-ish: safe to re-run in a fresh local Supabase.

insert into courses (slug, title, description, icon, color, sort_order, status) values
  ('foundations', 'Music Foundations', 'Notes, scales, keys and the piano roll.', 'piano', '#CBF24E', 1, 'published'),
  ('beats',       'Beats & Rhythm',    'Four-on-the-floor to half-time grooves.', 'grid_view', '#8B7CFF', 2, 'published'),
  ('harmony',     'Melody & Harmony',  'Chords, progressions and basslines.', 'music_note', '#4FE3E0', 3, 'published'),
  ('sound',       'Sound Design',      'Subtractive, wavetable and FM synthesis.', 'tune', '#FF5C93', 4, 'published'),
  ('arrangement', 'Arrangement',       'Build tension and structure a track.', 'architecture', '#FF9A3C', 5, 'published'),
  ('mixing',      'Mixing',            'Gain staging, EQ and sidechain.', 'equalizer', '#CBF24E', 6, 'published'),
  ('mastering',   'Mastering',         'Loudness, translation and -14 LUFS.', 'campaign', '#8B7CFF', 7, 'published'),
  ('ai',          'Produce with AI',   'Suno & Udio -> stems -> your DAW.', 'auto_awesome', '#8B7CFF', 8, 'draft')
on conflict (slug) do nothing;

insert into achievements (code, name, description, icon, color) values
  ('first_beat',     'First Beat',       'Made your first 8-bar loop.', 'bolt', '#CBF24E'),
  ('week_warrior',   'Week Warrior',     'Kept a 7-day streak alive.', 'local_fire_department', '#FF9A3C'),
  ('golden_ears',    'Golden Ears',      '20 EQ challenges in a row.', 'hearing', '#4FE3E0'),
  ('in_key',         'In Key',           'Built 10 diatonic progressions.', 'piano', '#8B7CFF'),
  ('balanced',       'Balanced',         'Finished a full mix session.', 'tune', '#FF5C93'),
  ('streaming_ready','Streaming Ready',  'Landed a master in the -14 LUFS pocket.', 'album', '#CBF24E'),
  ('full_arc',       'Full Arc',         'Arranged intro -> drop -> outro.', 'architecture', '#4FE3E0'),
  ('ai_producer',    'AI Producer',      'Completed the Produce-with-AI track.', 'smart_toy', '#8B7CFF')
on conflict (code) do nothing;

insert into content_sources (name, kind, cadence, ok) values
  ('Ableton changelog', 'firecrawl', 'daily', true),
  ('Suno changelog', 'firecrawl', 'daily', true),
  ('iZotope blog', 'firecrawl', 'weekly', true),
  ('Manual uploads', 'manual', 'on-demand', false)
on conflict do nothing;
