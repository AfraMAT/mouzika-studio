'use client';

import { useState } from 'react';
import { getEngine } from '@/lib/audio/engine';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { formatFreq } from '@/lib/theory';
import { Icon } from '@/components/ui/Icon';
import { PracticeShell } from '@/components/app/PracticeShell';

const OPTIONS = [125, 250, 500, 1000, 2000, 4000, 8000];

function randomIdx(exclude?: number): number {
  let i = Math.floor(Math.random() * OPTIONS.length);
  if (exclude !== undefined && OPTIONS.length > 1) while (i === exclude) i = Math.floor(Math.random() * OPTIONS.length);
  return i;
}

export function EQChallenge() {
  const { t } = useI18n();
  const engine = getEngine();
  const { state, recordDrill } = useProgress();
  const [answerIdx, setAnswerIdx] = useState(() => randomIdx());
  const [guessIdx, setGuessIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState<'flat' | 'boost' | null>(null);

  const play = (boosted: boolean) => {
    engine.playEq(OPTIONS[answerIdx], boosted);
    setPlaying(boosted ? 'boost' : 'flat');
    window.setTimeout(() => setPlaying(null), 1600);
  };

  const guess = (i: number) => {
    if (revealed) return;
    const correct = i === answerIdx;
    setGuessIdx(i);
    setRevealed(true);
    recordDrill('eq', correct);
  };

  const next = () => {
    setAnswerIdx((prev) => randomIdx(prev));
    setGuessIdx(null);
    setRevealed(false);
  };

  const correct = revealed && guessIdx === answerIdx;

  return (
    <PracticeShell title={t.eq.title} subtitle={t.eq.sub} backLabel={t.eq.back} score={state.drills.eqScore} streak={state.drills.eqStreak} scoreLabel={t.eq.score} streakLabel={t.eq.streak}>
      <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 26 }}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <button
            onClick={() => play(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 14.5,
              padding: '13px 22px',
              borderRadius: 13,
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.14)',
              background: playing === 'flat' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)',
              color: '#F4F5F7',
            }}
          >
            <Icon name="volume_up" size={19} /> {t.eq.playFlat}
          </button>
          <button
            onClick={() => play(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 14.5,
              padding: '13px 22px',
              borderRadius: 13,
              cursor: 'pointer',
              border: 'none',
              boxShadow: playing === 'boost' ? '0 2px 0 #7f9f2b' : '0 4px 0 #7f9f2b',
              transform: playing === 'boost' ? 'translateY(2px)' : 'none',
              background: '#CBF24E',
              color: '#0A0B10',
            }}
          >
            <Icon name="graphic_eq" size={19} fill /> {t.eq.playBoost}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9aa0ad', margin: '0 0 18px' }}>{t.eq.question}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))', gap: 10 }}>
          {OPTIONS.map((f, i) => {
            const isAns = i === answerIdx;
            const isGuess = i === guessIdx;
            let bg = '#171922';
            let bd = 'rgba(255,255,255,0.08)';
            let col = '#c8ccd6';
            if (revealed) {
              if (isAns) {
                bg = 'rgba(203,242,78,0.15)';
                bd = '#CBF24E';
                col = '#CBF24E';
              } else if (isGuess) {
                bg = 'rgba(255,92,147,0.14)';
                bd = '#FF5C93';
                col = '#FF5C93';
              }
            }
            return (
              <button
                key={f}
                onClick={() => guess(i)}
                style={{
                  padding: '17px 8px',
                  borderRadius: 14,
                  border: `1.5px solid ${bd}`,
                  background: bg,
                  color: col,
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 14.5,
                  cursor: revealed ? 'default' : 'pointer',
                  transition: 'all .14s',
                }}
              >
                {formatFreq(f)}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: correct ? '#CBF24E' : '#FF5C93', margin: '0 0 14px' }}>
              {correct ? t.eq.correct : `${t.eq.wrong} · ${t.eq.answerWas} ${formatFreq(OPTIONS[answerIdx])}`}
            </p>
            <button
              onClick={next}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, padding: '11px 20px', borderRadius: 12, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #93B81F' }}
            >
              {t.eq.next} <Icon name="arrow_forward" size={18} />
            </button>
          </div>
        )}

        <p style={{ marginTop: 24, fontSize: 12.5, color: '#6b6f7d', textAlign: 'center', lineHeight: 1.6 }}>{t.eq.hint}</p>
      </div>
    </PracticeShell>
  );
}
