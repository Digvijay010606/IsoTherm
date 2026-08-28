create table if not exists public.reports (
  id uuid primary key,
  created_at timestamptz not null default now(),
  category_id text not null,
  detail text,
  zone_id text not null,
  lat double precision not null,
  lon double precision not null,
  photo_path text,

  constraint reports_category_id_allowed check (
    category_id in ('no-shade', 'no-water', 'unsafe-site', 'hot-indoors', 'cooling-shut', 'no-cover')
  ),
  constraint reports_detail_length check (detail is null or char_length(detail) <= 600),
  constraint reports_zone_id_format check (zone_id ~ '^[A-Z]-[0-9]{1,2}$'),
  constraint reports_lat_within_area check (lat between 29.69 and 29.79),
  constraint reports_lon_within_area check (lon between -95.50 and -95.37),
  constraint reports_photo_path_format check (
    photo_path is null or photo_path ~ '^[0-9a-f-]{36}/photo\.[a-z0-9]{1,5}$'
  )
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert on public.reports to anon, authenticated;
revoke update, delete on public.reports from anon, authenticated;

drop policy if exists "reports are publicly readable" on public.reports;
create policy "reports are publicly readable"
  on public.reports for select
  to anon, authenticated
  using (true);

drop policy if exists "anyone may file a report" on public.reports;
create policy "anyone may file a report"
  on public.reports for insert
  to anon, authenticated
  with check (true);

insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "report photos are publicly readable" on storage.objects;
create policy "report photos are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'report-photos');

drop policy if exists "anyone may attach a report photo" on storage.objects;
create policy "anyone may attach a report photo"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'report-photos');

do $$
begin
  alter publication supabase_realtime add table public.reports;
exception
  when duplicate_object then null;
end
$$;
