'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { PRIMARY_NAV, SECONDARY_NAV, MOBILE_NAV, MOBILE_MORE_NAV } from '@/lib/nav';
import { EqBars } from '@/components/ui/EqLogo';
import { Icon } from '@/components/ui/Icon';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

function railLabel(t: ReturnType<typeof useI18n>['t'], key: string): string {
  const map: Record<string, string> = {
    learn: t.rail.learn,
    practice: t.rail.practice,
    studio: t.rail.studio,
    tutor: t.rail.tutor,
    feedback: t.rail.feedback,
    codex: t.navx.codex,
    discover: t.navx.discover,
    leaderboard: t.navx.leaderboard,
    profile: t.navx.profile,
  };
  return map[key] ?? key;
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/learn') return pathname === '/learn';
  return pathname === href || pathname.startsWith(href + '/');
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { state, level, hydrated } = useProgress();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close the mobile "More" menu on outside tap and on navigation. (A fixed
  // overlay can't be used for outside-tap: the header's backdrop-filter makes it
  // the containing block for position:fixed children, confining it to the header.)
  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el || !el.closest('[data-more-menu]')) setMoreOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <div className="dotted-bg" style={{ minHeight: '100vh', background: '#0a0b10', color: '#F4F5F7' }}>
      {/* ---------- desktop left rail ---------- */}
      <aside
        className="hidden lg:flex no-scrollbar"
        style={{
          position: 'fixed',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: 92,
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 0',
          gap: 6,
          background: 'rgba(13,14,20,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
          zIndex: 200,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Link href="/learn" aria-label="Mouzika home" style={{ marginBottom: 12 }}>
          <EqBars height={26} barW={4} />
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {PRIMARY_NAV.map((item) => (
            <RailButton key={item.key} href={item.href} icon={item.icon} label={railLabel(t, item.key)} active={isActive(pathname, item.href)} />
          ))}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '8px 14px' }} />
          {SECONDARY_NAV.map((item) => (
            <RailButton key={item.key} href={item.href} icon={item.icon} label={railLabel(t, item.key)} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            title={`${t.profile.streak}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 9px',
              borderRadius: 100,
              background: 'rgba(255,154,60,0.12)',
              color: '#FF9A3C',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            <Icon name="local_fire_department" size={15} fill color="#FF9A3C" />
            {hydrated ? state.streak : '·'}
          </div>
          <div
            title={`Level ${level}`}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              color: '#0A0B10',
            }}
          >
            {state.name.charAt(0)}
          </div>
          <LanguageSwitch compact />
        </div>
      </aside>

      {/* ---------- mobile top header ---------- */}
      <header
        className="flex lg:hidden"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 14px',
          background: 'rgba(10,11,16,0.82)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link href="/learn" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <EqBars height={20} barW={3.5} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
            mouzika<span style={{ color: '#CBF24E' }}>.studio</span>
          </span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LanguageSwitch compact />
          <button
            type="button"
            data-more-menu
            onClick={() => setMoreOpen((o) => !o)}
            aria-label={t.rail.more}
            aria-expanded={moreOpen}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 11,
              background: moreOpen ? 'rgba(203,242,78,0.12)' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: moreOpen ? '#CBF24E' : '#c8ccd6',
              cursor: 'pointer',
            }}
          >
            <Icon name="grid_view" size={20} />
          </button>
        </div>

        {moreOpen && (
            <div
              data-more-menu
              style={{
                position: 'absolute',
                top: '100%',
                insetInlineEnd: 12,
                marginTop: 8,
                minWidth: 200,
                background: '#141620',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14,
                padding: 8,
                boxShadow: 'var(--shadow-pop)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 300,
              }}
            >
              {MOBILE_MORE_NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 12px',
                      borderRadius: 10,
                      textDecoration: 'none',
                      background: active ? 'rgba(203,242,78,0.1)' : 'transparent',
                      color: active ? '#CBF24E' : '#c8ccd6',
                    }}
                  >
                    <Icon name={item.icon} size={20} fill={active} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{railLabel(t, item.key)}</span>
                  </Link>
                );
              })}
            </div>
        )}
      </header>

      {/* ---------- content ---------- */}
      <main className="lg:ps-[92px] pb-24 lg:pb-0" style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </main>

      {/* ---------- mobile bottom tab bar ---------- */}
      <nav
        className="flex lg:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          insetInline: 0,
          zIndex: 200,
          justifyContent: 'space-around',
          padding: '10px 8px calc(10px + env(safe-area-inset-bottom))',
          background: 'rgba(13,14,20,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {MOBILE_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', color: active ? '#CBF24E' : '#6b6f7d', padding: '2px 10px' }}
            >
              <Icon name={item.icon} size={24} fill={active} />
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>{railLabel(t, item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function RailButton({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      title={label}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        width: 72,
        padding: '9px 0',
        borderRadius: 14,
        textDecoration: 'none',
        transition: 'all .14s',
        background: active ? 'rgba(203,242,78,0.12)' : 'transparent',
        color: active ? '#CBF24E' : '#8a8f9c',
      }}
    >
      <Icon name={icon} size={24} fill={active} />
      <span style={{ fontSize: 10.5, fontWeight: 600 }}>{label}</span>
    </Link>
  );
}
