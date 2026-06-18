import type { Profile } from '../features/auth/AuthContext';

type Role = Profile['role'];
type Purpose = Profile['purpose'] | undefined | null;

const ROLE_LANDING: Record<string, string> = {
  'Super Admin': '/super-admin/dashboard',
  Admin: '/admin',
  Instructor: '/instructor',
  'Printer Operator': '/printing',
};

function getPurpose(profile: Profile) {
  return profile.purpose || 'learn';
}

export function getLandingRoute(profile: Profile) {
  const role = profile.role || '';
  if (ROLE_LANDING[role]) {
    return ROLE_LANDING[role];
  }

  const purpose = getPurpose(profile);
  if (purpose === 'learn') return '/student/dashboard';
  if (purpose === 'print') return '/printing';
  if (purpose === 'hire') return '/projects';
  return '/student/dashboard';
}

export function isRouteAllowed(pathname: string, profile: Profile) {
  const role = profile.role || '';
  const purpose = getPurpose(profile);

  if (role === 'Super Admin') return pathname.startsWith('/super-admin');
  if (role === 'Admin') return pathname.startsWith('/admin');
  if (role === 'Instructor') return pathname.startsWith('/instructor');
  if (role === 'Printer Operator') return pathname.startsWith('/printing');

  if (pathname.startsWith('/student')) return purpose === 'learn' || purpose === 'both';
  if (pathname.startsWith('/projects')) return purpose === 'hire' || purpose === 'both';
  if (pathname.startsWith('/printing')) return purpose === 'print' || purpose === 'both';
  if (pathname.startsWith('/dashboard')) return false;

  return true;
}
