'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CODEX, CODEX_CAT_COLORS } from '@/lib/content/codex';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { HoverCard } from '@/components/ui/primitives';

const MUTED = '#9aa0ad';
const MUTED2 = '#6b6f7d';
const INK = '#F4F5F7';
const LIME = '#CBF24E';

export default function CodexPage() {
  const t = useT();
  const [activeCat, setActiveCat] = useState<number>(0);
  const [query, setQuery] = useState<string>('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CODEX.filter((entry) => {
      if (activeCat !== 0 && entry.cat !== activeCat) return false;
      if (!q) return true;
      const label = (t.codex.cats[entry.cat] ?? '').toLowerCase();
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.summary.toLowerCase().includes(q) ||
        label.includes(q)
      );
    });
  }, [activeCat, query, t]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: INK,
          margin: '0 0 8px',
        }}
      >
        {t.codex.title}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: MUTED,
          lineHeight: 1.6,
          maxWidth: 640,
          margin: '0 0 22px',
        }}
      >
        {t.codex.sub}
      </p>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#171922',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '11px 14px',
          marginBottom: 16,
        }}
      >
        <Icon name="search" size={18} color={MUTED} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.codex.searchPh}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: INK,
            fontFamily: 'var(--font-sans)',
            fontSize: 14.5,
          }}
        />
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {t.codex.cats.map((cat, i) => {
          const active = i === activeCat;
          const activeBg = i === 0 ? LIME : CODEX_CAT_COLORS[i];
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveCat(i)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 12.5,
                padding: '8px 14px',
                borderRadius: 100,
                cursor: 'pointer',
                background: active ? activeBg : 'transparent',
                color: active ? '#0A0B10' : '#9aa0ad',
                border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                transition: 'background .16s ease, color .16s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: MUTED2,
          margin: '0 0 16px',
        }}
      >
        {`${filtered.length} ${t.codex.results}`}
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((entry) => {
          const color = CODEX_CAT_COLORS[entry.cat];
          return (
            <Link
              key={entry.id}
              href={`/codex/${entry.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <HoverCard
                hoverBorder={`${color}55`}
                style={{
                  background: '#111219',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 18,
                  padding: 20,
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span
                  style={{
                    alignSelf: 'flex-start',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '4px 9px',
                    borderRadius: 6,
                    background: `${color}22`,
                    color,
                    textTransform: 'uppercase',
                  }}
                >
                  {t.codex.cats[entry.cat]}
                </span>

                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 17,
                    color: INK,
                    margin: '12px 0 0',
                    lineHeight: 1.3,
                  }}
                >
                  {entry.title}
                </h2>

                <p
                  style={{
                    fontSize: 14,
                    color: MUTED,
                    lineHeight: 1.5,
                    margin: '8px 0 0',
                    flex: 1,
                  }}
                >
                  {entry.summary}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginTop: 14,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: MUTED2,
                  }}
                >
                  <span>{`${entry.readMin} ${t.codex.minRead}`}</span>
                  <span>{`${t.codex.updated} ${entry.updated}`}</span>
                </div>
              </HoverCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
