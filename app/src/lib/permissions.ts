import type { MemberRole } from '../types/domain';

export type Action =
  | 'add_song'
  | 'manage_parts'
  | 'build_arrangement'
  | 'assign_owner'
  | 'assign_lead'
  | 'assign_backup'
  | 'assign_musician'
  | 'announce'
  | 'manage_members';

const PERMS: Record<MemberRole, Action[] | '*'> = {
  director: '*',
  section_lead: [
    'add_song',
    'manage_parts',
    'build_arrangement',
    'assign_owner',
    'assign_lead',
    'assign_backup',
    'assign_musician',
    'announce',
  ],
  musician: [],
  chorister: [],
};

export function can(role: MemberRole | undefined | null, action: Action): boolean {
  if (!role) return false;
  const allowed = PERMS[role];
  return allowed === '*' || allowed.includes(action);
}

export const ROLE_LABEL: Record<MemberRole, string> = {
  director: 'Director',
  section_lead: 'Section Lead',
  musician: 'Musician',
  chorister: 'Chorister',
};
