-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Create users table (extends auth.users)
create table public.users (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    created_at timestamp with time zone default now(),
    is_admin boolean default false,
    daily_review_limit integer default 1,
    pending_invitations integer default 0,
    last_invitation_received timestamp with time zone
);

-- Create cities table
create table public.cities (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    state text not null,
    country text not null default 'USA',
    bounds jsonb not null, -- GeoJSON polygon for city boundaries
    created_at timestamp with time zone default now()
);

-- Create locations table
create table public.locations (
    id uuid default uuid_generate_v4() primary key,
    business_name text not null,
    address text not null,
    latitude decimal(10, 8) not null,
    longitude decimal(11, 8) not null,
    pin_latitude decimal(10, 8),
    pin_longitude decimal(11, 8),
    city_id uuid references public.cities(id) not null,
    created_by uuid references public.users(id) not null,
    created_at timestamp with time zone default now(),
    hidden boolean default false,
    upvotes integer default 1, -- Auto-upvote by creator
    downvotes integer default 0
);

-- Create reviews table
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    location_id uuid references public.locations(id) on delete cascade not null,
    user_id uuid references public.users(id) not null,
    title text,
    address_note text,
    star_rating decimal(2,1) not null check (star_rating >= 1 and star_rating <= 5 and (star_rating * 2) = floor(star_rating * 2)), -- Half star increments
    review_text text check (length(review_text) <= 500),
    photos text[], -- Array of Supabase storage URLs
    created_at timestamp with time zone default now(),
    hidden boolean default false,
    upvotes integer default 1, -- Auto-upvote by creator
    downvotes integer default 0
);

-- Create votes table
create table public.votes (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) not null,
    target_id uuid not null, -- Can reference locations.id or reviews.id
    target_type text not null check (target_type in ('location', 'review')),
    vote_type text not null check (vote_type in ('up', 'down')),
    created_at timestamp with time zone default now(),
    unique(user_id, target_id, target_type)
);

-- Create favorites table
create table public.favorites (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.users(id) not null,
    location_id uuid references public.locations(id) on delete cascade not null,
    created_at timestamp with time zone default now(),
    unique(user_id, location_id)
);

-- Create invitations table
create table public.invitations (
    id uuid default uuid_generate_v4() primary key,
    access_code text not null unique,
    created_by uuid references public.users(id) not null,
    sent_to_email text not null,
    used_by uuid references public.users(id),
    used_at timestamp with time zone,
    created_at timestamp with time zone default now()
);

-- Create admin_actions table for moderation logging
create table public.admin_actions (
    id uuid default uuid_generate_v4() primary key,
    admin_user_id uuid references public.users(id) not null,
    action_type text not null, -- 'HIDE_REVIEW', 'HIDE_LOCATION', etc.
    target_id uuid not null,
    reason text,
    created_at timestamp with time zone default now()
);

-- Create app_settings table for configurable values
create table public.app_settings (
    key text primary key,
    value jsonb not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Insert default cities (San Francisco and Boston)
insert into public.cities (name, state, country, bounds) values
('San Francisco', 'CA', 'USA', '{
    "type": "Polygon",
    "coordinates": [[
        [-122.5149, 37.7088],
        [-122.3549, 37.7088],
        [-122.3549, 37.8144],
        [-122.5149, 37.8144],
        [-122.5149, 37.7088]
    ]]
}'),
('Boston', 'MA', 'USA', '{
    "type": "Polygon",
    "coordinates": [[
        [-71.1912, 42.2279],
        [-70.9235, 42.2279],
        [-70.9235, 42.3967],
        [-71.1912, 42.3967],
        [-71.1912, 42.2279]
    ]]
}');

-- Insert default app settings
insert into public.app_settings (key, value) values
('pin_validation_distance_feet', '500'),
('first_invitation_after_reviews', '1'),
('second_invitation_after_reviews', '5'),
('third_invitation_after_reviews', '20'),
('invitation_cooldown_days', '7');

-- Create indexes for better performance
create index idx_locations_city_id on public.locations(city_id);
create index idx_locations_coordinates on public.locations(latitude, longitude);
create index idx_locations_hidden on public.locations(hidden);
create index idx_reviews_location_id on public.reviews(location_id);
create index idx_reviews_user_id on public.reviews(user_id);
create index idx_reviews_hidden on public.reviews(hidden);
create index idx_reviews_created_at on public.reviews(created_at);
create index idx_votes_user_target on public.votes(user_id, target_id, target_type);
create index idx_favorites_user_id on public.favorites(user_id);
create index idx_invitations_access_code on public.invitations(access_code);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.cities enable row level security;
alter table public.locations enable row level security;
alter table public.reviews enable row level security;
alter table public.votes enable row level security;
alter table public.favorites enable row level security;
alter table public.invitations enable row level security;
alter table public.admin_actions enable row level security;
alter table public.app_settings enable row level security;

-- RLS Policies

-- Users: Users can only read/update their own profile
create policy "Users can view their own profile" on public.users
    for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.users
    for update using (auth.uid() = id);

-- Cities: Everyone can read cities
create policy "Everyone can view cities" on public.cities
    for select using (true);

-- Locations: Everyone can read non-hidden locations, authenticated users can create
create policy "Everyone can view non-hidden locations" on public.locations
    for select using (not hidden);

create policy "Authenticated users can create locations" on public.locations
    for insert with check (auth.role() = 'authenticated');

create policy "Users can update their own locations" on public.locations
    for update using (auth.uid() = created_by);

-- Reviews: Everyone can read non-hidden reviews, authenticated users can create
create policy "Everyone can view non-hidden reviews" on public.reviews
    for select using (not hidden);

create policy "Authenticated users can create reviews" on public.reviews
    for insert with check (auth.role() = 'authenticated');

-- Votes: Users can manage their own votes
create policy "Users can view their own votes" on public.votes
    for select using (auth.uid() = user_id);

create policy "Users can manage their own votes" on public.votes
    for all using (auth.uid() = user_id);

-- Favorites: Users can manage their own favorites
create policy "Users can view their own favorites" on public.favorites
    for select using (auth.uid() = user_id);

create policy "Users can manage their own favorites" on public.favorites
    for all using (auth.uid() = user_id);

-- Invitations: Users can view invitations they created or used
create policy "Users can view relevant invitations" on public.invitations
    for select using (auth.uid() = created_by or auth.uid() = used_by);

create policy "Authenticated users can create invitations" on public.invitations
    for insert with check (auth.role() = 'authenticated');

create policy "Users can update invitations they can access" on public.invitations
    for update using (auth.uid() = created_by or auth.uid() = used_by);

-- Admin actions: Only admins can read admin actions
create policy "Admins can view admin actions" on public.admin_actions
    for select using (
        exists (
            select 1 from public.users
            where id = auth.uid() and is_admin = true
        )
    );

create policy "Admins can create admin actions" on public.admin_actions
    for insert with check (
        exists (
            select 1 from public.users
            where id = auth.uid() and is_admin = true
        )
    );

-- App settings: Everyone can read, only admins can modify
create policy "Everyone can view app settings" on public.app_settings
    for select using (true);

create policy "Admins can manage app settings" on public.app_settings
    for all using (
        exists (
            select 1 from public.users
            where id = auth.uid() and is_admin = true
        )
    );

-- Functions

-- Function to update vote counts when votes are added/updated/deleted
create or replace function update_vote_counts()
returns trigger as $$
begin
    if TG_TABLE_NAME = 'votes' then
        if TG_OP = 'INSERT' then
            -- Add vote
            if NEW.target_type = 'location' then
                if NEW.vote_type = 'up' then
                    update public.locations set upvotes = upvotes + 1 where id = NEW.target_id;
                else
                    update public.locations set downvotes = downvotes + 1 where id = NEW.target_id;
                end if;
            elsif NEW.target_type = 'review' then
                if NEW.vote_type = 'up' then
                    update public.reviews set upvotes = upvotes + 1 where id = NEW.target_id;
                else
                    update public.reviews set downvotes = downvotes + 1 where id = NEW.target_id;
                end if;
            end if;
        elsif TG_OP = 'UPDATE' then
            -- Change vote type
            if NEW.target_type = 'location' then
                if OLD.vote_type = 'up' and NEW.vote_type = 'down' then
                    update public.locations set upvotes = upvotes - 1, downvotes = downvotes + 1 where id = NEW.target_id;
                elsif OLD.vote_type = 'down' and NEW.vote_type = 'up' then
                    update public.locations set upvotes = upvotes + 1, downvotes = downvotes - 1 where id = NEW.target_id;
                end if;
            elsif NEW.target_type = 'review' then
                if OLD.vote_type = 'up' and NEW.vote_type = 'down' then
                    update public.reviews set upvotes = upvotes - 1, downvotes = downvotes + 1 where id = NEW.target_id;
                elsif OLD.vote_type = 'down' and NEW.vote_type = 'up' then
                    update public.reviews set upvotes = upvotes + 1, downvotes = downvotes - 1 where id = NEW.target_id;
                end if;
            end if;
        elsif TG_OP = 'DELETE' then
            -- Remove vote
            if OLD.target_type = 'location' then
                if OLD.vote_type = 'up' then
                    update public.locations set upvotes = upvotes - 1 where id = OLD.target_id;
                else
                    update public.locations set downvotes = downvotes - 1 where id = OLD.target_id;
                end if;
            elsif OLD.target_type = 'review' then
                if OLD.vote_type = 'up' then
                    update public.reviews set upvotes = upvotes - 1 where id = OLD.target_id;
                else
                    update public.reviews set downvotes = downvotes - 1 where id = OLD.target_id;
                end if;
            end if;
        end if;
    end if;

    if TG_OP = 'DELETE' then
        return OLD;
    else
        return NEW;
    end if;
end;
$$ language plpgsql security definer;

-- Create triggers for vote counting
create trigger votes_update_counts_trigger
    after insert or update or delete on public.votes
    for each row execute function update_vote_counts();

-- Function to handle user registration
create or replace function handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, email, is_admin)
    values (
        new.id,
        new.email,
        -- First user becomes admin if no admin exists
        not exists (select 1 from public.users where is_admin = true)
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_user();

-- Function to generate unique access codes
create or replace function generate_access_code()
returns text as $$
declare
    code text;
begin
    loop
        code := upper(substring(md5(random()::text) from 1 for 8));
        exit when not exists (select 1 from public.invitations where access_code = code);
    end loop;
    return code;
end;
$$ language plpgsql security definer;