-- Onboarding bootstrap RPCs.
--
-- A brand-new authenticated user has no membership yet, so RLS (which keys
-- everything off existing membership) blocks both "create a choir" and
-- "claim an invite". These security-definer functions perform the bootstrap
-- in a controlled way and are the ONLY path the client uses for onboarding.

-- Create a new choir and make the caller its director.
create or replace function create_choir_as_director(p_choir_name text, p_display_name text)
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_choir choirs;
  v_member members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into choirs (name) values (p_choir_name) returning * into v_choir;

  insert into members (choir_id, user_id, name, contact, role, avail, color, active)
  values (v_choir.id, auth.uid(), p_display_name, auth.email(), 'director', 'available', '#3F3795', true)
  returning * into v_member;

  return v_member;
end;
$$;

-- Claim a pre-seeded, unclaimed member row whose contact matches the caller's email.
-- Returns the claimed row, or null if there is no matching invite.
create or replace function claim_membership(p_email text)
returns members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member members;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update members
     set user_id = auth.uid(), avail = 'available'
   where id = (
     select id from members
      where user_id is null and lower(contact) = lower(p_email)
      limit 1
   )
  returning * into v_member;

  return v_member;
end;
$$;

grant execute on function create_choir_as_director(text, text) to authenticated;
grant execute on function claim_membership(text) to authenticated;
