/** Shared navigation model for the app shell. Labels come from i18n at render. */

export interface NavItem {
  href: string;
  icon: string;
  key: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { href: '/learn', icon: 'home', key: 'learn' },
  { href: '/practice', icon: 'fitness_center', key: 'practice' },
  { href: '/studio', icon: 'piano', key: 'studio' },
  { href: '/tutor', icon: 'auto_awesome', key: 'tutor' },
  { href: '/feedback', icon: 'graphic_eq', key: 'feedback' },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: '/codex', icon: 'menu_book', key: 'codex' },
  { href: '/discover', icon: 'explore', key: 'discover' },
  { href: '/leaderboard', icon: 'emoji_events', key: 'leaderboard' },
  { href: '/profile', icon: 'account_circle', key: 'profile' },
];

export const MOBILE_NAV: NavItem[] = [
  { href: '/learn', icon: 'home', key: 'learn' },
  { href: '/practice', icon: 'fitness_center', key: 'practice' },
  { href: '/studio', icon: 'piano', key: 'studio' },
  { href: '/tutor', icon: 'auto_awesome', key: 'tutor' },
  { href: '/profile', icon: 'account_circle', key: 'profile' },
];
