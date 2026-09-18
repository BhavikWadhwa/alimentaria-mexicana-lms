-- One restaurant per Supabase project. Never use user-editable JWT metadata for access.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.job_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(name) between 1 and 100)
);
insert into public.job_roles(name) values ('Head Chef'), ('Prep Cook'), ('Line Cook'), ('Front of House'), ('Management');

create table public.employees (
  id uuid primary key references auth.users(id),
  first_name text not null default '' check (length(first_name) <= 100),
  last_name text not null default '' check (length(last_name) <= 100),
  email text not null unique,
  app_role text not null default 'EMPLOYEE' check (app_role in ('ADMIN','MANAGER','EMPLOYEE')),
  job_role_id uuid references public.job_roles(id),
  active boolean not null default false,
  station text check (length(station) <= 100),
  created_at timestamptz not null default now()
);

-- New identities have no access until an administrator activates their employee record.
-- This also makes an accidentally enabled public sign-up harmless for LMS access.
create function private.sync_identity() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.employees(id,email) values(new.id,new.email);
  else
    update public.employees set email = new.email where id = new.id;
  end if;
  return new;
end; $$;
create trigger sync_employee_identity after insert or update of email on auth.users for each row execute function private.sync_identity();

create table public.learning_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('TRAINING','SOP')),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 4000),
  category text not null default 'General' check (length(trim(category)) between 1 and 80),
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  restricted boolean not null default false,
  duration_minutes integer check (duration_minutes between 1 and 600),
  pass_mark integer not null default 80 check (pass_mark between 1 and 100),
  created_by uuid not null references public.employees(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.item_role_access (
  item_id uuid not null references public.learning_items(id),
  role_id uuid not null references public.job_roles(id),
  primary key (item_id,role_id)
);
create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.learning_items(id),
  type text not null check (type in ('heading','text','callout','image','document','video')),
  body text not null check (length(trim(body)) between 1 and 20000),
  sort_order integer not null check (sort_order >= 0),
  unique(item_id,sort_order)
);
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.learning_items(id),
  prompt text not null check(length(trim(prompt)) between 1 and 2000),
  options jsonb not null check(jsonb_typeof(options) = 'array' and jsonb_array_length(options) between 2 and 6),
  sort_order integer not null,
  unique(item_id,sort_order)
);
-- Correct answers are physically separate: a question SELECT can never expose them.
create table private.quiz_answers (
  question_id uuid primary key references public.quiz_questions(id) on delete cascade,
  correct_index integer not null check(correct_index between 0 and 5)
);
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id),
  module_id uuid not null references public.learning_items(id),
  module_title text not null,
  assigned_by uuid not null references public.employees(id),
  assigned_at timestamptz not null default now(),
  status text not null default 'NOT_STARTED' check(status in ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  started_at timestamptz,
  content_completed_at timestamptz,
  completed_at timestamptz,
  unique(employee_id,module_id),
  check ((status = 'NOT_STARTED' and started_at is null and completed_at is null) or
         (status = 'IN_PROGRESS' and started_at is not null and completed_at is null) or
         (status = 'COMPLETED' and started_at is not null and content_completed_at is not null and completed_at is not null))
);
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id),
  employee_id uuid not null references public.employees(id),
  score integer not null check(score between 0 and 100),
  passed boolean not null,
  pass_mark integer not null,
  question_count integer not null,
  attempted_at timestamptz not null default now()
);
create index assignments_module on public.assignments(module_id);
create index quiz_attempts_assignment on public.quiz_attempts(assignment_id,attempted_at desc);

-- SECURITY DEFINER helpers bypass recursive RLS only to read authoritative access
-- records. They use a fixed search_path and never trust a caller-provided role.
create function private.current_role() returns text language sql stable security definer set search_path = '' as $$
  select app_role from public.employees where id = auth.uid() and active
$$;
create function private.role_allowed(target uuid, employee uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.learning_items i join public.employees e on e.id = employee
    where i.id = target and e.active and (e.app_role = 'ADMIN' or not i.restricted or exists(
      select 1 from public.item_role_access r where r.item_id = i.id and r.role_id = e.job_role_id)))
$$;
create function private.can_read_item(target uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.learning_items i where i.id = target and (
    private.current_role() = 'ADMIN' or
    (i.status = 'PUBLISHED' and private.role_allowed(i.id,auth.uid()) and
      (i.kind = 'SOP' or private.current_role() = 'MANAGER' or exists(
        select 1 from public.assignments a where a.module_id = i.id and a.employee_id = auth.uid())))))
$$;

alter table public.job_roles enable row level security;
alter table public.employees enable row level security;
alter table public.learning_items enable row level security;
alter table public.item_role_access enable row level security;
alter table public.content_blocks enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.assignments enable row level security;
alter table public.quiz_attempts enable row level security;
alter table private.quiz_answers enable row level security;

-- Employee self-read also requires active status. A still-valid JWT does not
-- preserve access after deactivation; every request reads the current profile.
create policy roles_read on public.job_roles for select to authenticated using(private.current_role() is not null);
create policy employees_read on public.employees for select to authenticated using(
  private.current_role() in ('ADMIN','MANAGER') or (id = auth.uid() and active));
create policy items_read on public.learning_items for select to authenticated using(private.can_read_item(id));
create policy access_read on public.item_role_access for select to authenticated using(private.can_read_item(item_id));
create policy blocks_read on public.content_blocks for select to authenticated using(private.can_read_item(item_id));
create policy questions_read on public.quiz_questions for select to authenticated using(private.can_read_item(item_id));
-- Management can retain and inspect historical results even when content is archived.
create policy assignments_read on public.assignments for select to authenticated using(
  private.current_role() in ('ADMIN','MANAGER') or (employee_id = auth.uid() and private.can_read_item(module_id)));
create policy attempts_read on public.quiz_attempts for select to authenticated using(
  private.current_role() in ('ADMIN','MANAGER') or (employee_id = auth.uid() and exists(
    select 1 from public.assignments a where a.id = assignment_id and private.can_read_item(a.module_id))));

revoke all on public.job_roles,public.employees,public.learning_items,public.item_role_access,public.content_blocks,public.quiz_questions,public.assignments,public.quiz_attempts from anon,authenticated;
grant select on public.job_roles,public.employees,public.learning_items,public.item_role_access,public.content_blocks,public.quiz_questions,public.assignments,public.quiz_attempts to authenticated;
grant all on public.job_roles,public.employees,public.learning_items,public.item_role_access,public.content_blocks,public.quiz_questions,public.assignments,public.quiz_attempts to service_role;

-- All writes use bounded RPCs. No client, including an admin client, can directly
-- forge a completion timestamp, quiz score, creator, or assignment owner.
create function public.update_employee(target uuid, first_name text, last_name text, app_role text, job_role_id uuid, active boolean, station text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if private.current_role() is distinct from 'ADMIN' then raise exception 'Not authorized'; end if;
  if target = auth.uid() and (not active or app_role <> 'ADMIN') then raise exception 'Cannot remove your own admin access'; end if;
  update public.employees e set first_name = update_employee.first_name, last_name = update_employee.last_name,
    app_role = update_employee.app_role, job_role_id = update_employee.job_role_id, active = update_employee.active,
    station = update_employee.station where e.id = target;
  if not found then raise exception 'Employee not found'; end if;
end; $$;

create function public.create_item(item_kind text, item_title text) returns uuid language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  if private.current_role() is distinct from 'ADMIN' then raise exception 'Not authorized'; end if;
  insert into public.learning_items(kind,title,created_by) values(item_kind,item_title,auth.uid()) returning id into result;
  return result;
end; $$;

create function public.save_item(draft jsonb) returns void language plpgsql security definer set search_path = '' as $$
declare target uuid := (draft->>'id')::uuid; block jsonb; question jsonb; question_id uuid; item public.learning_items; position integer := 0;
begin
  if private.current_role() is distinct from 'ADMIN' then raise exception 'Not authorized'; end if;
  select * into item from public.learning_items where id = target for update;
  if not found or item.status <> 'DRAFT' then raise exception 'Only drafts may be edited'; end if;
  if jsonb_typeof(draft->'blocks') <> 'array' or jsonb_typeof(draft->'questions') <> 'array' or jsonb_typeof(draft->'role_ids') <> 'array' then raise exception 'Invalid content'; end if;
  if jsonb_array_length(draft->'blocks') > 100 or jsonb_array_length(draft->'questions') > 50 then raise exception 'Too much content'; end if;
  if (draft->>'restricted')::boolean and jsonb_array_length(draft->'role_ids') = 0 then raise exception 'Choose allowed roles'; end if;
  if item.kind = 'SOP' and jsonb_array_length(draft->'questions') > 0 then raise exception 'SOPs do not have quizzes'; end if;
  update public.learning_items set title = draft->>'title', description = draft->>'description', category = draft->>'category',
    restricted = (draft->>'restricted')::boolean, duration_minutes = (draft->>'duration_minutes')::integer,
    pass_mark = (draft->>'pass_mark')::integer, updated_at = clock_timestamp() where id = target;
  delete from public.item_role_access where item_id = target;
  insert into public.item_role_access select target,value::uuid from jsonb_array_elements_text(draft->'role_ids');
  delete from public.content_blocks where item_id = target;
  for block in select value from jsonb_array_elements(draft->'blocks') loop
    if block->>'type' in ('image','document') or (block->>'type' = 'video' and block->>'body' not like 'https://%') then
      if block->>'body' !~ ('^' || target::text || '/[a-f0-9-]{36}$') then raise exception 'Invalid private file reference'; end if;
    end if;
    if (draft->>'restricted')::boolean and block->>'type' = 'video' and block->>'body' like 'https://%' then raise exception 'Restricted videos require private uploads'; end if;
    insert into public.content_blocks(item_id,type,body,sort_order) values(target,block->>'type',block->>'body',position);
    position := position + 1;
  end loop;
  delete from public.quiz_questions where item_id = target;
  position := 0;
  for question in select value from jsonb_array_elements(draft->'questions') loop
    if (question->>'correct_index')::integer not between 0 and jsonb_array_length(question->'options') - 1 then raise exception 'Invalid answer'; end if;
    if exists(select 1 from jsonb_array_elements_text(question->'options') o where length(trim(o)) not between 1 and 1000) then raise exception 'Invalid option'; end if;
    insert into public.quiz_questions(item_id,prompt,options,sort_order) values(target,question->>'prompt',question->'options',position) returning id into question_id;
    insert into private.quiz_answers values(question_id,(question->>'correct_index')::integer);
    position := position + 1;
  end loop;
  -- Learners in progress must acknowledge the revised content. Finished records
  -- are immutable; full content versioning and recertification are deferred.
  update public.assignments set content_completed_at = null where module_id = target and status <> 'COMPLETED';
end; $$;

create function public.editor_answers(target uuid) returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if private.current_role() is distinct from 'ADMIN' then raise exception 'Not authorized'; end if;
  return coalesce((select jsonb_object_agg(q.id,a.correct_index) from public.quiz_questions q join private.quiz_answers a on a.question_id = q.id where q.item_id = target),'{}'::jsonb);
end; $$;

create function public.set_item_status(target uuid, next_status text) returns void language plpgsql security definer set search_path = '' as $$
declare item public.learning_items;
begin
  if private.current_role() is distinct from 'ADMIN' then raise exception 'Not authorized'; end if;
  select * into item from public.learning_items where id = target for update;
  if not found then raise exception 'Item not found'; end if;
  if next_status = 'PUBLISHED' then
    if not exists(select 1 from public.content_blocks where item_id = target) then raise exception 'Add content before publishing'; end if;
    if item.restricted and not exists(select 1 from public.item_role_access where item_id = target) then raise exception 'Choose allowed roles'; end if;
  end if;
  update public.learning_items set status = next_status,updated_at = clock_timestamp() where id = target;
end; $$;

create function public.assign_training(employee uuid, module uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare item public.learning_items; result uuid;
begin
  if private.current_role() is null or private.current_role() not in ('ADMIN','MANAGER') then raise exception 'Not authorized'; end if;
  select * into item from public.learning_items where id = module for share;
  if not found or item.kind <> 'TRAINING' or item.status <> 'PUBLISHED' or not private.can_read_item(module) or not private.role_allowed(module,employee) then raise exception 'Assignment not allowed'; end if;
  insert into public.assignments(employee_id,module_id,module_title,assigned_by) values(employee,module,item.title,auth.uid())
    on conflict(employee_id,module_id) do nothing returning id into result;
  if result is null then select id into result from public.assignments where employee_id = employee and module_id = module; end if;
  return result;
end; $$;

create function public.advance_training(target uuid, acknowledge_content boolean default false) returns void language plpgsql security definer set search_path = '' as $$
declare assignment public.assignments; item public.learning_items;
begin
  select * into assignment from public.assignments where id = target;
  if not found or assignment.employee_id <> auth.uid() or not private.can_read_item(assignment.module_id) then raise exception 'Not authorized'; end if;
  -- Match the editor's module-before-assignment lock order to avoid deadlocks.
  select * into item from public.learning_items where id = assignment.module_id for share;
  select * into assignment from public.assignments where id = target for update;
  if item.status <> 'PUBLISHED' then raise exception 'Training unavailable'; end if;
  if assignment.status = 'COMPLETED' then return; end if;
  update public.assignments set status = 'IN_PROGRESS',started_at = coalesce(started_at,now()),
    content_completed_at = case when acknowledge_content then coalesce(content_completed_at,now()) else content_completed_at end where id = target;
  if acknowledge_content and not exists(select 1 from public.quiz_questions where item_id = assignment.module_id) then
    update public.assignments set status = 'COMPLETED',completed_at = now() where id = target;
  end if;
end; $$;

-- The answer map contains question UUID -> option index, never a client score.
-- Lock the assignment and module so duplicate submissions and edits cannot race.
create function public.submit_quiz(target uuid, answers jsonb) returns jsonb language plpgsql security definer set search_path = '' as $$
declare assignment public.assignments; item public.learning_items; question record; total integer := 0; correct integer := 0; score integer; passed boolean; choice integer;
begin
  select * into assignment from public.assignments where id = target;
  if not found or assignment.employee_id <> auth.uid() or not private.can_read_item(assignment.module_id) then raise exception 'Not authorized'; end if;
  select * into item from public.learning_items where id = assignment.module_id for share;
  select * into assignment from public.assignments where id = target for update;
  if item.status <> 'PUBLISHED' or assignment.content_completed_at is null or assignment.status = 'COMPLETED' then raise exception 'Complete content before taking quiz'; end if;
  if jsonb_typeof(answers) <> 'object' then raise exception 'Invalid answers'; end if;
  for question in select q.id,q.options,a.correct_index from public.quiz_questions q join private.quiz_answers a on a.question_id = q.id where q.item_id = item.id loop
    if not answers ? question.id::text or jsonb_typeof(answers->question.id::text) <> 'number' then raise exception 'Answer every question'; end if;
    choice := (answers->>question.id::text)::integer;
    if choice not between 0 and jsonb_array_length(question.options)-1 then raise exception 'Invalid choice'; end if;
    total := total + 1;
    if choice = question.correct_index then correct := correct + 1; end if;
  end loop;
  if total = 0 or (select count(*) from jsonb_object_keys(answers)) <> total then raise exception 'Invalid answers'; end if;
  score := floor(100.0 * correct / total);
  passed := score >= item.pass_mark;
  insert into public.quiz_attempts(assignment_id,employee_id,score,passed,pass_mark,question_count) values(target,auth.uid(),score,passed,item.pass_mark,total);
  if passed then update public.assignments set status = 'COMPLETED',completed_at = now() where id = target; end if;
  return jsonb_build_object('score',score,'passed',passed);
end; $$;

revoke all on all functions in schema private from public,anon,authenticated;
grant execute on function private.current_role(),private.can_read_item(uuid) to authenticated;
revoke all on function public.update_employee(uuid,text,text,text,uuid,boolean,text),public.create_item(text,text),public.save_item(jsonb),public.editor_answers(uuid),public.set_item_status(uuid,text),public.assign_training(uuid,uuid),public.advance_training(uuid,boolean),public.submit_quiz(uuid,jsonb) from public,anon;
grant execute on function public.update_employee(uuid,text,text,text,uuid,boolean,text),public.create_item(text,text),public.save_item(jsonb),public.editor_answers(uuid),public.set_item_status(uuid,text),public.assign_training(uuid,uuid),public.advance_training(uuid,boolean),public.submit_quiz(uuid,jsonb) to authenticated;

-- No client SELECT policy: even an authorized client cannot mint a signed URL
-- that would survive deactivation. The authenticated application proxies bytes
-- after a fresh RLS check. No confidential file enters public/ or a public bucket.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('pilot-content','pilot-content',false,26214400,array['image/jpeg','image/png','image/webp','application/pdf','video/mp4','video/webm']);
