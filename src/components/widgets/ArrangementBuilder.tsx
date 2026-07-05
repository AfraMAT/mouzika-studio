'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { PracticeShell } from '@/components/app/PracticeShell';

const DEFS = [
  { bars: 16, energy: 3, color: '#4FE3E0' },
  { bars: 16, energy: 5, color: '#8B7CFF' },
  { bars: 8, energy: 7, color: '#FF9A3C' },
  { bars: 32, energy: 10, color: '#CBF24E' },
  { bars: 16, energy: 3, color: '#FF5C93' },
];

export function ArrangementBuilder() {
  const { t } = useI18n();
  const [items, setItems] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const headRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (headRef.current) headRef.current.style.opacity = '0';
    setPlaying(false);
  };

  const play = () => {
    if (playing) {
      stop();
      return;
    }
    if (items.length === 0) return;
    setPlaying(true);
    const start = performance.now();
    const dur = 6000;
    if (headRef.current) headRef.current.style.opacity = '1';
    timerRef.current = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / dur);
      if (headRef.current) headRef.current.style.left = `${p * 100}%`;
      if (p >= 1) stop();
    }, 30);
  };

  const total = items.reduce((a, i) => a + DEFS[i].bars, 0);
  const mins = total > 0 ? ((total * 4) / 124).toFixed(1) : '0';

  // energy polyline points across 0..100 x, energy 0..10 → y 38..2
  let pts = '';
  if (items.length) {
    let acc = 0;
    const ey = (e: number) => 38 - (e / 10) * 36;
    items.forEach((idx) => {
      const d = DEFS[idx];
      const x0 = total > 0 ? (acc / total) * 100 : 0;
      acc += d.bars;
      const x1 = total > 0 ? (acc / total) * 100 : 0;
      pts += `${x0.toFixed(1)},${ey(d.energy).toFixed(1)} ${x1.toFixed(1)},${ey(d.energy).toFixed(1)} `;
    });
  }

  return (
    <PracticeShell title={t.arrange.title} subtitle={t.arrange.sub} backLabel={t.arrange.back}>
      {/* palette */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 10 }}>{t.arrange.palette}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 8, marginBottom: 22 }}>
        {t.arrange.secs.map((nm, i) => (
          <button
            key={nm}
            onClick={() => setItems((it) => [...it, i])}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              background: '#141620',
              border: `1px solid ${DEFS[i].color}33`,
              borderRadius: 14,
              padding: '14px 6px',
              cursor: 'pointer',
              transition: 'transform .15s, border-color .15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = DEFS[i].color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.borderColor = `${DEFS[i].color}33`;
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: 7, background: DEFS[i].color, marginBottom: 8 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#e4e7ee' }}>{nm}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6b6f7d' }}>{DEFS[i].bars} {t.arrange.bars}</span>
          </button>
        ))}
      </div>

      {/* timeline card */}
      <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#c8ccd6' }}>{t.arrange.timeline}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={play} disabled={items.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 11, padding: '8px 15px', cursor: items.length ? 'pointer' : 'default', opacity: items.length ? 1 : 0.5, boxShadow: `0 3px 0 ${playing ? '#b56a26' : '#2f8f8d'}`, background: playing ? '#FF9A3C' : '#4FE3E0', color: '#0A0B10' }}>
              <Icon name={playing ? 'stop' : 'play_arrow'} size={17} fill /> {playing ? t.arrange.stop : t.arrange.play}
            </button>
            <button onClick={() => setItems((it) => it.slice(0, -1))} title={t.arrange.undo} style={iconBtn}>
              <Icon name="undo" size={17} />
            </button>
            <button onClick={() => { stop(); setItems([]); }} title={t.arrange.clear} style={iconBtn}>
              <Icon name="delete_sweep" size={17} />
            </button>
          </div>
        </div>

        {/* energy curve */}
        {items.length > 0 && (
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.08em', color: '#6b6f7d', marginBottom: 4 }}>{t.arrange.energy}</div>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: 60, display: 'block' }}>
              <polyline points={pts.trim()} fill="none" stroke="#CBF24E" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        )}

        {/* blocks */}
        <div style={{ position: 'relative' }}>
          {items.length === 0 ? (
            <div style={{ padding: '30px 16px', textAlign: 'center', border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: 12, color: '#6b6f7d', fontSize: 13.5, lineHeight: 1.6 }}>{t.arrange.empty}</div>
          ) : (
            <div style={{ display: 'flex', gap: 3, height: 54 }}>
              {items.map((idx, k) => {
                const d = DEFS[idx];
                const w = total > 0 ? (d.bars / total) * 100 : 0;
                return (
                  <div key={k} style={{ flex: `0 0 ${w}%`, minWidth: 34, background: d.color, borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, overflow: 'hidden' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#0A0B10', whiteSpace: 'nowrap' }}>{t.arrange.secs[idx]}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(10,11,16,0.7)' }}>{d.bars}</span>
                  </div>
                );
              })}
              <div ref={headRef} style={{ position: 'absolute', top: -4, bottom: -4, left: 0, width: 2, background: '#fff', opacity: 0, boxShadow: '0 0 8px #fff' }} />
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div style={{ display: 'flex', gap: 18, marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#8a8f9c' }}>
            <span>{total} {t.arrange.bars} {t.arrange.total}</span>
            <span>{mins} {t.arrange.mins}</span>
          </div>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12.5, color: '#6b6f7d', lineHeight: 1.6 }}>{t.arrange.tip}</p>
    </PracticeShell>
  );
}

const iconBtn: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  color: '#9aa0ad',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 11,
  cursor: 'pointer',
};
