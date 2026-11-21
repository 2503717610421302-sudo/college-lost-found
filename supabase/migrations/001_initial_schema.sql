-- =================================================================
-- CampusFinder - Full Database Migration
-- Run this in your Supabase SQL Editor
-- =================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =================================================================
-- TABLES
-- =================================================================

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  avatar_url text,
  department text,
  register_number text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Items table
create table if not exists public.items (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  item_type text not null check (item_type in ('lost', 'found')),
  location text not null,
  event_date date not null,
  image_url text,
  additional_details text,
  status text not null default 'active' check (status in ('active', 'claimed', 'returned', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Claims table
create table if not exists public.claims (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.items(id) on delete cascade,
  claimant_id uuid not null references public.profiles(id) on delete cascade,
  finder_id uuid not null references public.profiles(id) on delete cascade,
  proof_description text not null,
  proof_image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'verification_needed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (item_id, claimant_id)
);

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  related_item_id uuid references public.items(id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Reports table (content moderation)
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_item_id uuid not null references public.items(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- =================================================================
-- INDEXES
-- =================================================================

create index if not exists items_reporter_id_idx on public.items(reporter_id);
create index if not exists items_item_type_idx on public.items(item_type);
create index if not exists items_status_idx on public.items(status);
create index if not exists items_category_idx on public.items(category);
create index if not exists items_created_at_idx on public.items(created_at desc);
create index if not exists claims_item_id_idx on public.claims(item_id);
create index if not exists claims_claimant_id_idx on public.claims(claimant_id);
create index if not exists claims_finder_id_idx on public.claims(finder_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);

-- =================================================================
-- TRIGGER: Auto-create profile on signup
-- =================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, department, register_number)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'department',
    new.raw_user_meta_data ->> 'register_number'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =================================================================
-- TRIGGER: Auto-update updated_at
-- =================================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists items_updated_at on public.items;
create trigger items_updated_at before update on public.items
  for each row execute procedure public.handle_updated_at();

drop trigger if exists claims_updated_at on public.claims;
create trigger claims_updated_at before update on public.claims
  for each row execute procedure public.handle_updated_at();

-- =================================================================
-- ROW LEVEL SECURITY
-- =================================================================

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

-- PROFILES policies
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

-- ITEMS policies
create policy "Items are publicly viewable"
  on public.items for select
  using (true);

create policy "Authenticated users can create items"
  on public.items for insert
  to authenticated
  with check (auth.uid() = reporter_id);

create policy "Users can update own items"
  on public.items for update
  to authenticated
  using (auth.uid() = reporter_id);

create policy "Users can delete own items"
  on public.items for delete
  to authenticated
  using (auth.uid() = reporter_id);

create policy "Admins can manage all items"
  on public.items for all
  to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- CLAIMS policies
create policy "Claims visible to involved parties only"
  on public.claims for select
  to authenticated
  using (auth.uid() = claimant_id or auth.uid() = finder_id);

create policy "Authenticated users can create claims"
  on public.claims for insert
  to authenticated
  with check (auth.uid() = claimant_id);

create policy "Finder can update claim status"
  on public.claims for update
  to authenticated
  using (auth.uid() = finder_id);

-- NOTIFICATIONS policies
create policy "Users can view own notifications"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);

create policy "Users can update own notifications"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id);

-- REPORTS policies
create policy "Admins can view all reports"
  on public.reports for select
  to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "Authenticated users can create reports"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- =================================================================
-- STORAGE BUCKET POLICIES (run after creating 'item-images' bucket)
-- =================================================================

-- Create bucket policy: users can upload to their own folder
-- Run this after creating the 'item-images' bucket in Supabase dashboard:

/*
-- Allow public read access
create policy "Public read access"
  on storage.objects for select
  using (bucket_id = 'item-images');

-- Allow authenticated users to upload images
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[2]);

-- Allow users to delete own files
create policy "Users can delete own files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[2]);
*/
