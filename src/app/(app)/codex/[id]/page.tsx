'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { CODEX, CODEX_CAT_COLORS } from '@/lib/content/codex';
import { Icon } from '@/components/ui/Icon';

export default function CodexEntryPage() {
  const { t, isRTL } = useI18n();
  const params = useParams();
  const id = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const entry = CODEX.find((e) => e.id === id);

  if (!entry) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#9aa0ad' }}>Entry not found.</p>
        <Link href="/codex" style={{ color: '#CBF24E' }}>
          {t.codex.back}
        </Link>
      </div>
    );
  }

  const tag = (ci: number) => ({
    display: 'inline-block',
    fontFamily: 'var(--font-mono)',
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: '0.06em',
    padding: '4px 9px',
    borderRadius: 6,
    background: `${CODEX_CAT_COLORS[ci]}22`,
    color: CODEX_CAT_COLORS[ci],
  });

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 20px 60px' }}>
      <Link href="/codex" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9aa0ad', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, marginBottom: 24 }}>
        <Icon name={isRTL ? 'arrow_forward' : 'arrow_back'} size={18} /> {t.codex.back}
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={tag(entry.cat)}>{t.codex.cats[entry.cat]}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#6b6f7d' }}>
          {entry.readMin} {t.codex.minRead} · {t.codex.updated} {entry.updated}
        </span>
      </div>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 26px' }}>{entry.title}</h1>

      <article>
        {entry.body.map((para, i) => (
          <p key={i} style={{ fontSize: i === 0 ? 16.5 : 15, lineHeight: i === 0 ? 1.7 : 1.78, color: i === 0 ? '#e7e9ee' : '#c8ccd6', margin: '0 0 20px' }}>
            {para}
          </p>
        ))}
      </article>

      {entry.related.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 14 }}>{t.codex.related}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
            {entry.related.map((ri) => {
              const r = CODEX.find((e) => e.id === ri);
              if (!r) return null;
              return (
                <Link
                  key={ri}
                  href={`/codex/${ri}`}
                  style={{ display: 'block', background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, textDecoration: 'none' }}
                >
                  <span style={tag(r.cat)}>{t.codex.cats[r.cat]}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#F4F5F7', marginTop: 10 }}>{r.title}</div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
