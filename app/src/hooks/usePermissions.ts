import { useAuth } from './useAuth';
import { can, ROLE_LABEL, type Action } from '../lib/permissions';

export function usePermissions() {
  const { member } = useAuth();
  return {
    can: (action: Action) => can(member?.role, action),
    roleLabel: member ? ROLE_LABEL[member.role] : '',
    isAdmin: member?.role === 'director',
  };
}
