-- AOS Consulting OS - Row Level Security Policies
-- Ensures consultants and clients can only access authorized data

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

alter table users enable row level security;
alter table clients enable row level security;
alter table engagements enable row level security;
alter table intake_forms enable row level security;
alter table proposals enable row level security;
alter table sessions enable row level security;
alter table session_summaries enable row level security;
alter table goals enable row level security;
alter table actions enable row level security;
alter table reflections enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table ai_usage_logs enable row level security;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is a consultant
create or replace function is_consultant()
returns boolean as $$
  select exists (
    select 1 from users
    where id = auth.uid() and role = 'consultant'
  );
$$ language sql security definer;

-- Check if user is a client
create or replace function is_client()
returns boolean as $$
  select exists (
    select 1 from users
    where id = auth.uid() and role = 'client'
  );
$$ language sql security definer;

-- Get client_id for current user (if they're a client)
create or replace function current_client_id()
returns uuid as $$
  select id from clients where user_id = auth.uid();
$$ language sql security definer;

-- Check if consultant owns a client
create or replace function consultant_owns_client(client_uuid uuid)
returns boolean as $$
  select exists (
    select 1 from clients
    where id = client_uuid and consultant_id = auth.uid()
  );
$$ language sql security definer;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own profile
create policy "Users can read own profile"
  on users for select
  using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- Consultants can read all users
create policy "Consultants can read all users"
  on users for select
  using (is_consultant());

-- New users can insert their own record (on signup)
create policy "Users can insert own record"
  on users for insert
  with check (auth.uid() = id);

-- ============================================================================
-- CLIENTS TABLE POLICIES
-- ============================================================================

-- Consultants can manage their clients
create policy "Consultants manage their clients"
  on clients for all
  using (consultant_id = auth.uid());

-- Clients can read their own client record
create policy "Clients read own record"
  on clients for select
  using (user_id = auth.uid());

-- ============================================================================
-- ENGAGEMENTS TABLE POLICIES
-- ============================================================================

-- Consultants can manage engagements for their clients
create policy "Consultants manage their engagements"
  on engagements for all
  using (
    exists (
      select 1 from clients
      where clients.id = engagements.client_id
      and clients.consultant_id = auth.uid()
    )
  );

-- Clients can view their engagements
create policy "Clients view their engagements"
  on engagements for select
  using (
    exists (
      select 1 from clients
      where clients.id = engagements.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================================================
-- INTAKE FORMS POLICIES
-- ============================================================================

-- Consultants can manage intake forms for their engagements
create policy "Consultants manage intake forms"
  on intake_forms for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = intake_forms.engagement_id
      and c.consultant_id = auth.uid()
    )
  );

-- Clients can view and submit their intake forms
create policy "Clients access their intake forms"
  on intake_forms for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = intake_forms.engagement_id
      and c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- PROPOSALS POLICIES
-- ============================================================================

-- Consultants manage all proposal stages
create policy "Consultants manage proposals"
  on proposals for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = proposals.engagement_id
      and c.consultant_id = auth.uid()
    )
  );

-- Clients see only approved/sent proposals
create policy "Clients view approved proposals"
  on proposals for select
  using (
    status in ('approved', 'sent', 'accepted', 'rejected')
    and exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = proposals.engagement_id
      and c.user_id = auth.uid()
    )
  );

-- Clients can update response on sent proposals
create policy "Clients respond to proposals"
  on proposals for update
  using (
    status = 'sent'
    and exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = proposals.engagement_id
      and c.user_id = auth.uid()
    )
  )
  with check (
    status in ('accepted', 'rejected')
  );

-- ============================================================================
-- SESSIONS POLICIES
-- ============================================================================

-- Consultants manage sessions for their engagements
create policy "Consultants manage sessions"
  on sessions for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = sessions.engagement_id
      and c.consultant_id = auth.uid()
    )
  );

-- Clients view completed sessions
create policy "Clients view sessions"
  on sessions for select
  using (
    status = 'completed'
    and exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = sessions.engagement_id
      and c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SESSION SUMMARIES POLICIES
-- ============================================================================

-- Consultants manage session summaries
create policy "Consultants manage summaries"
  on session_summaries for all
  using (
    exists (
      select 1 from sessions s
      join engagements e on e.id = s.engagement_id
      join clients c on c.id = e.client_id
      where s.id = session_summaries.session_id
      and c.consultant_id = auth.uid()
    )
  );

-- Clients see only published summaries
create policy "Clients view published summaries"
  on session_summaries for select
  using (
    status = 'published'
    and exists (
      select 1 from sessions s
      join engagements e on e.id = s.engagement_id
      join clients c on c.id = e.client_id
      where s.id = session_summaries.session_id
      and c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- GOALS POLICIES
-- ============================================================================

-- Consultants manage goals for their engagements
create policy "Consultants manage goals"
  on goals for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = goals.engagement_id
      and c.consultant_id = auth.uid()
    )
  );

-- Clients can view and update their goals
create policy "Clients access their goals"
  on goals for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = goals.engagement_id
      and c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- ACTIONS POLICIES
-- ============================================================================

-- Consultants manage actions for their engagements
create policy "Consultants manage actions"
  on actions for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = actions.engagement_id
      and c.consultant_id = auth.uid()
    )
  );

-- Clients can view and update their actions
create policy "Clients access their actions"
  on actions for all
  using (
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = actions.engagement_id
      and c.user_id = auth.uid()
    )
  );

-- ============================================================================
-- REFLECTIONS POLICIES
-- ============================================================================

-- Consultants can view reflections from their clients
create policy "Consultants view client reflections"
  on reflections for select
  using (
    exists (
      select 1 from clients
      where clients.id = reflections.client_id
      and clients.consultant_id = auth.uid()
    )
  );

-- Clients manage their own reflections
create policy "Clients manage own reflections"
  on reflections for all
  using (
    exists (
      select 1 from clients
      where clients.id = reflections.client_id
      and clients.user_id = auth.uid()
    )
  );

-- ============================================================================
-- MESSAGES POLICIES
-- ============================================================================

-- Users can view messages in their engagements
create policy "Users view engagement messages"
  on messages for select
  using (
    -- Consultant sees messages for their clients
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = messages.engagement_id
      and c.consultant_id = auth.uid()
    )
    or
    -- Client sees messages in their engagements
    exists (
      select 1 from engagements e
      join clients c on c.id = e.client_id
      where e.id = messages.engagement_id
      and c.user_id = auth.uid()
    )
  );

-- Users can send messages in their engagements
create policy "Users send messages in engagements"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and (
      -- Consultant can send to their clients
      exists (
        select 1 from engagements e
        join clients c on c.id = e.client_id
        where e.id = messages.engagement_id
        and c.consultant_id = auth.uid()
      )
      or
      -- Client can send in their engagements
      exists (
        select 1 from engagements e
        join clients c on c.id = e.client_id
        where e.id = messages.engagement_id
        and c.user_id = auth.uid()
      )
    )
  );

-- Users can mark messages as read if they're the recipient
create policy "Users mark messages read"
  on messages for update
  using (
    sender_id != auth.uid()
    and (
      exists (
        select 1 from engagements e
        join clients c on c.id = e.client_id
        where e.id = messages.engagement_id
        and (c.consultant_id = auth.uid() or c.user_id = auth.uid())
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can read their own notifications
create policy "Users read own notifications"
  on notifications for select
  using (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
create policy "Users update own notifications"
  on notifications for update
  using (user_id = auth.uid());

-- System can insert notifications (via service role)
create policy "Service role inserts notifications"
  on notifications for insert
  with check (true);

-- ============================================================================
-- AI USAGE LOGS POLICIES
-- ============================================================================

-- Consultants can view AI usage for their engagements
create policy "Consultants view AI usage"
  on ai_usage_logs for select
  using (
    is_consultant()
    and (
      engagement_id is null
      or exists (
        select 1 from engagements e
        join clients c on c.id = e.client_id
        where e.id = ai_usage_logs.engagement_id
        and c.consultant_id = auth.uid()
      )
    )
  );

-- Service role can insert AI usage logs
create policy "Service role logs AI usage"
  on ai_usage_logs for insert
  with check (true);
