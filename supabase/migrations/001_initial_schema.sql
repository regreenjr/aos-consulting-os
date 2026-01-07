-- AOS Consulting OS - Initial Database Schema
-- This migration creates all core tables for the consulting platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Users table (extends Supabase auth.users)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('consultant', 'client')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- CLIENT MANAGEMENT
-- ============================================================================

-- Clients table - Links client users to their consultant
create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  consultant_id uuid references users(id) on delete restrict not null,
  company_name text,
  industry text,
  onboarded_at timestamptz,
  status text default 'active' check (status in ('active', 'paused', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- ENGAGEMENTS & PROJECTS
-- ============================================================================

-- Engagements (consulting projects)
create table engagements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- INTAKE & PROPOSALS
-- ============================================================================

-- Intake forms (questionnaires)
create table intake_forms (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  questions jsonb not null default '[]',
  responses jsonb not null default '{}',
  submitted_at timestamptz,
  created_at timestamptz default now()
);

-- Proposals (AI-generated with approval workflow)
create table proposals (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  intake_form_id uuid references intake_forms(id) on delete set null,
  content text not null,
  status text default 'draft' check (status in ('draft', 'pending_review', 'approved', 'sent', 'accepted', 'rejected')),
  ai_generated_at timestamptz,
  approved_by uuid references users(id) on delete set null,
  approved_at timestamptz,
  sent_at timestamptz,
  client_response text,
  client_responded_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- SESSIONS & SUMMARIES
-- ============================================================================

-- Sessions (consulting meetings)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  session_number int not null,
  scheduled_at timestamptz,
  completed_at timestamptz,
  duration_minutes int,
  consultant_notes text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Session summaries (AI-generated with approval)
create table session_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null unique,
  content text not null,
  key_insights jsonb default '[]',
  status text default 'draft' check (status in ('draft', 'pending_review', 'approved', 'published')),
  ai_generated_at timestamptz,
  approved_by uuid references users(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- GOALS & ACTIONS
-- ============================================================================

-- Goals (client objectives)
create table goals (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  title text not null,
  description text,
  target_date date,
  status text default 'active' check (status in ('active', 'achieved', 'deferred')),
  achieved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Actions (tasks and next steps)
create table actions (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  session_id uuid references sessions(id) on delete set null,
  goal_id uuid references goals(id) on delete set null,
  title text not null,
  description text,
  assigned_to text default 'client' check (assigned_to in ('client', 'consultant', 'both')),
  due_date date,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- REFLECTIONS & MESSAGING
-- ============================================================================

-- Reflections (client journal entries)
create table reflections (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  client_id uuid references clients(id) on delete cascade not null,
  content text not null,
  prompt text,
  created_at timestamptz default now()
);

-- Messages (consultant ↔ client communication)
create table messages (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete cascade not null,
  sender_id uuid references users(id) on delete cascade not null,
  content text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications (in-app and email triggers)
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  type text not null check (type in ('message', 'action_due', 'session_summary', 'proposal', 'general')),
  title text not null,
  content text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================================================
-- AI USAGE TRACKING
-- ============================================================================

-- AI usage logs (for cost tracking and analytics)
create table ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references engagements(id) on delete set null,
  operation text not null,
  prompt_tokens int,
  completion_tokens int,
  total_tokens int,
  cost_usd numeric(10, 6),
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Clients
create index idx_clients_consultant on clients(consultant_id);
create index idx_clients_user on clients(user_id);

-- Engagements
create index idx_engagements_client on engagements(client_id);
create index idx_engagements_status on engagements(status);

-- Sessions
create index idx_sessions_engagement on sessions(engagement_id);
create index idx_sessions_scheduled on sessions(scheduled_at);

-- Actions
create index idx_actions_engagement on actions(engagement_id);
create index idx_actions_status_due on actions(status, due_date);
create index idx_actions_session on actions(session_id);

-- Messages
create index idx_messages_engagement on messages(engagement_id);
create index idx_messages_created on messages(created_at desc);
create index idx_messages_sender on messages(sender_id);

-- Notifications
create index idx_notifications_user_unread on notifications(user_id, read_at) where read_at is null;
create index idx_notifications_created on notifications(created_at desc);

-- Goals
create index idx_goals_engagement on goals(engagement_id);
create index idx_goals_status on goals(status);

-- Reflections
create index idx_reflections_engagement on reflections(engagement_id);
create index idx_reflections_client on reflections(client_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables with updated_at
create trigger update_users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger update_clients_updated_at before update on clients
  for each row execute function update_updated_at();

create trigger update_engagements_updated_at before update on engagements
  for each row execute function update_updated_at();

create trigger update_proposals_updated_at before update on proposals
  for each row execute function update_updated_at();

create trigger update_sessions_updated_at before update on sessions
  for each row execute function update_updated_at();

create trigger update_session_summaries_updated_at before update on session_summaries
  for each row execute function update_updated_at();

create trigger update_goals_updated_at before update on goals
  for each row execute function update_updated_at();

create trigger update_actions_updated_at before update on actions
  for each row execute function update_updated_at();
