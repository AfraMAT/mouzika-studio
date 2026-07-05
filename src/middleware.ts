import { NextResponse, type NextRequest } from 'next/server';

/**
 * Hostname-based routing so one deployment serves three faces:
 *   - mouzika.studio         → marketing landing (apex)
 *   - app.mouzika.studio     → the learner app (home = /learn)
 *   - admin.mouzika.studio   → the admin console (/admin)
 *
 * On the apex, links into the app or admin are redirected to their subdomain
 * so each surface stays on its own host. On localhost and *.vercel.app there
 * are no subdomains, so everything is served from a single origin unchanged.
 */

const APP_HOST = 'app.mouzika.studio';
const ADMIN_HOST = 'admin.mouzika.studio';
const APEX_HOSTS = ['mouzika.studio', 'www.mouzika.studio'];

// Learner-app routes that belong on app.mouzika.studio.
const APP_PREFIXES = [
  '/learn',
  '/lesson',
  '/studio',
  '/practice',
  '/tutor',
  '/feedback',
  '/codex',
  '/discover',
  '/profile',
  '/leaderboard',
  '/onboarding',
];

function isAppPath(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  const { pathname, search } = req.nextUrl;

  // ---- admin subdomain ----
  if (host === ADMIN_HOST) {
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }
    if (isAppPath(pathname)) {
      return NextResponse.redirect(new URL(`https://${APP_HOST}${pathname}${search}`));
    }
    return NextResponse.next();
  }

  // ---- app subdomain ----
  if (host === APP_HOST) {
    if (pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = '/learn';
      return NextResponse.rewrite(url);
    }
    if (isAdminPath(pathname)) {
      return NextResponse.redirect(new URL(`https://${ADMIN_HOST}/`));
    }
    return NextResponse.next();
  }

  // ---- apex / www (production marketing front door) ----
  if (APEX_HOSTS.includes(host)) {
    if (isAdminPath(pathname)) {
      return NextResponse.redirect(new URL(`https://${ADMIN_HOST}/`));
    }
    if (isAppPath(pathname)) {
      return NextResponse.redirect(new URL(`https://${APP_HOST}${pathname}${search}`));
    }
    return NextResponse.next();
  }

  // ---- localhost / *.vercel.app / previews → single origin, no rewrites ----
  return NextResponse.next();
}

export const config = {
  // Run on page routes only; skip API, Next internals, and static files (with a dot).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
