-- Run this in Supabase SQL Editor

create table if not exists sb_visits (
  id bigserial primary key,
  world text,
  device text,
  browser text,
  created_at timestamptz default now()
);

create table if not exists sb_song_plays (
  id bigserial primary key,
  world text,
  title text,
  video_id text,
  created_at timestamptz default now()
);

create table if not exists sb_live_viewers (
  tab_key text primary key,
  world text,
  device text,
  song text,
  video_id text,
  updated_at timestamptz default now()
);

create table if not exists sb_time_spent (
  id bigserial primary key,
  seconds int,
  created_at timestamptz default now()
);

-- Enable realtime on live_viewers
alter publication supabase_realtime add table sb_live_viewers;

-- Allow public read/write (anon key)
alter table sb_visits enable row level security;
alter table sb_song_plays enable row level security;
alter table sb_live_viewers enable row level security;
alter table sb_time_spent enable row level security;

create policy "allow all" on sb_visits for all using (true) with check (true);
create policy "allow all" on sb_song_plays for all using (true) with check (true);
create policy "allow all" on sb_live_viewers for all using (true) with check (true);
create policy "allow all" on sb_time_spent for all using (true) with check (true);
