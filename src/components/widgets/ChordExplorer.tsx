'use client';

import { useState } from 'react';
import { getEngine } from '@/lib/audio/engine';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { NOTE_NAMES, ROMAN, PROGRESSION, chordNoteNames, pitchClass, keyName, type ScaleType } from '@/lib/theory';
import { Icon } from '@/components/ui/Icon';
import { PracticeShell } from '@/components/app/PracticeShell';

export function ChordExplorer() {
  const { t } = useI18n();
  const engine = getEngine();
  const { recordReview } = useProgress();
  const [root, setRoot] = useState(0);
  const [scale, setScale] = useState<ScaleType>('minor');
  const [activeDeg, setActiveDeg] = useState<number | null>(null);

  const playChord = (deg: number) => {
    const notes = chordNoteNames(deg, root, scale);
    engine.playChord(notes);
    setActiveDeg(deg);
    window.setTimeout(() => setActiveDeg((d) => (d === deg ? null : d)), 750);
  };

  const playProgression = () => {
    const chords = PROGRESSION[scale].map((deg) => chordNoteNames(deg, root, scale));
    engine.playProgression(chords, (i) => setActiveDeg(PROGRESSION[scale][i]));
    window.setTimeout(() => setActiveDeg(null), 3200);
    recordReview('theory-chords', true);
  };

  const romans = ROMAN[scale];

  return (
    <PracticeShell title={t.chords.title} subtitle={t.chords.sub} backLabel={t.chords.back}>
      <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 26 }}>
        {/* root + scale selectors */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 22 }}>
          <div style={{ flex: '1 1 260px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 8 }}>{t.chords.root}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6 }}>
              {NOTE_NAMES.map((n, i) => (
                <button
                  key={n}
                  onClick={() => setRoot(i)}
                  style={{ padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12.5, transition: 'all .12s', background: root === i ? '#4FE3E0' : '#171922', color: root === i ? '#0A0B10' : '#8a8f9c' }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: '0 0 180px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 8 }}>{t.chords.scale}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['major', 'minor'] as ScaleType[]).map((sc) => (
                <button
                  key={sc}
                  onClick={() => setScale(sc)}
                  style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13, transition: 'all .12s', background: scale === sc ? '#4FE3E0' : '#171922', color: scale === sc ? '#0A0B10' : '#8a8f9c' }}
                >
                  {sc === 'major' ? t.chords.major : t.chords.minor}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13, color: '#9aa0ad' }}>
            {t.chords.chordsLabel} · <b style={{ color: '#4FE3E0' }}>{keyName(root, scale, t.chords.major, t.chords.minor)}</b>
          </div>
          <button
            onClick={playProgression}
            style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13.5, padding: '10px 18px', borderRadius: 12, border: 'none', background: '#4FE3E0', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #2f8f8d' }}
          >
            <Icon name="play_arrow" size={18} fill /> {t.chords.play}
          </button>
        </div>

        {/* chord pads */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(88px,1fr))', gap: 10 }}>
          {romans.map((r, deg) => {
            const notes = chordNoteNames(deg, root, scale).map((n) => pitchClass(n));
            const active = activeDeg === deg;
            return (
              <button
                key={r}
                onClick={() => playChord(deg)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '18px 6px',
                  borderRadius: 14,
                  border: `1.5px solid ${active ? '#4FE3E0' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? 'rgba(79,227,224,0.15)' : '#111219',
                  cursor: 'pointer',
                  transition: 'all .12s',
                  transform: active ? 'translateY(-3px)' : 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: active ? '#4FE3E0' : '#F4F5F7' }}>{r}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#8a8f9c' }}>{notes.join(' ')}</span>
              </button>
            );
          })}
        </div>

        <p style={{ marginTop: 22, fontSize: 12.5, color: '#6b6f7d', lineHeight: 1.6 }}>{t.chords.tip}</p>
      </div>
    </PracticeShell>
  );
}
