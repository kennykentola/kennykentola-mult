import type { Profile } from '../features/auth/AuthContext';

type Role = Profile['role'];
type Purpose = Profile['purpose'] | undefined | null;

const ROLE_LANDING: Record<string, string> = {
  'Super Admin': '/super-admin/dashboard',
  Admin: '/admin',
  Instructor: '/instructor',
  'Printer Operator': '/printing',
  Mentor: '/mentor/dashboard',
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
  if (purpose === 'learn') return '/student/dashboard'; // Wait, is it student/dashboard? Let's check below. If student portal uses /student
  if (purpose === 'academic') return '/dashboard/academic';
  if (purpose === 'maintenance') return '/dashboard/solar';
  if (purpose === 'print') return '/dashboard/printing';
  if (purpose === 'hire') return '/dashboard/projects';
  return '/student/dashboard';
}

export function isRouteAllowed(pathname: string, profile: Profile) {
  const role = profile.role || '';
  const purpose = getPurpose(profile);

  if (role === 'Super Admin') return pathname.startsWith('/super-admin');
  if (role === 'Admin') return pathname.startsWith('/admin');
  if (role === 'Instructor') return pathname.startsWith('/instructor');
  if (role === 'Printer Operator') return pathname.startsWith('/printing');
  if (role === 'Mentor') return pathname.startsWith('/mentor');

  if (pathname.startsWith('/student')) return purpose === 'learn' || purpose === 'both';
  if (pathname.startsWith('/dashboard/academic')) return purpose === 'academic' || purpose === 'both';
  if (pathname.startsWith('/dashboard/solar') || pathname.startsWith('/dashboard/tickets')) return purpose === 'maintenance' || purpose === 'both';
  if (pathname.startsWith('/dashboard/projects')) return purpose === 'hire' || purpose === 'both';
  if (pathname.startsWith('/dashboard/printing')) return purpose === 'print' || purpose === 'both';
  if (pathname === '/dashboard') return true; // Allow root dashboard page which might redirect or show generic UI


  return true;
}
