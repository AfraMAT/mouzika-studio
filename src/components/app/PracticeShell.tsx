'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';

/** Wrapper for a practice drill: back-to-practice bar, title, and optional score chips. */
export function PracticeShell({
  title,
  subtitle,
  backLabel,
  score,
  streak,
  scoreLabel,
  streakLabel,
  children,
}: {
  title: string;
  subtitle: string;
  backLabel: string;
  score?: number;
  streak?: number;
  scoreLabel?: string;
  streakLabel?: string;
  children: React.ReactNode;
}) {
  const { isRTL } = useI18n();
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
        <Link
          href="/practice"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9aa0ad', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}
        >
          <Icon name={isRTL ? 'arrow_forward' : 'arrow_back'} size={18} /> {backLabel}
        </Link>
        {(score !== undefined || streak !== undefined) && (
          <div style={{ display: 'flex', gap: 10 }}>
            {score !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#CBF24E', background: 'rgba(203,242,78,0.1)', padding: '6px 12px', borderRadius: 9 }}>
                {scoreLabel} {score}
              </span>
            )}
            {streak !== undefined && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#FF9A3C', background: 'rgba(255,154,60,0.1)', padding: '6px 12px', borderRadius: 9 }}>
                <Icon name="local_fire_department" size={14} fill color="#FF9A3C" /> {streak}
              </span>
            )}
          </div>
        )}
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{title}</h1>
      <p style={{ fontSize: 15, color: '#9aa0ad', lineHeight: 1.6, margin: '0 0 26px', maxWidth: 620 }}>{subtitle}</p>
      {children}
    </div>
  );
}
