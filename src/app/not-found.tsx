'use client';

import { useI18n } from '@/lib/i18n';
import { EqBars } from '@/components/ui/EqLogo';
import { Icon } from '@/components/ui/Icon';

/**
 * Branded, translated 404. Renders inside the root layout's Providers, so it
 * picks up the user's locale instead of falling back to Next's bare default.
 */
export default function NotFound() {
  const { t } = useI18n();
  const nf = t.notFound;
  return (
    <div
      className="dotted-bg"
      style={{
        minHeight: '100vh',
        background: '#0a0b10',
        color: '#F4F5F7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 24px',
        gap: 18,
      }}
    >
      <EqBars height={34} />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 72, fontWeight: 700, color: '#CBF24E', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {nf.code}
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, margin: 0 }}>{nf.title}</h1>
      <p style={{ fontSize: 15, color: '#9aa0ad', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>{nf.message}</p>
      <a
        href="/learn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 9,
          fontWeight: 700,
          fontSize: 15,
          padding: '13px 24px',
          borderRadius: 13,
          background: '#CBF24E',
          color: '#0A0B10',
          textDecoration: 'none',
          boxShadow: '0 4px 0 #7f9f2b',
          marginTop: 6,
        }}
      >
        <Icon name="arrow_back" size={19} /> {nf.home}
      </a>
    </div>
  );
}
