'use client';

import { useState } from 'react';
import { getEngine } from '@/lib/audio/engine';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { EAR_SEMITONES } from '@/lib/theory';
import { Icon } from '@/components/ui/Icon';
import { PracticeShell } from '@/components/app/PracticeShell';

export function EarTraining() {
  const { t } = useI18n();
  const engine = getEngine();
  const { state, recordDrill } = useProgress();
  const [answer, setAnswer] = useState(() => Math.floor(Math.random() * EAR_SEMITONES.length));
  const [guess, setGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [played, setPlayed] = useState(false);

  const play = () => {
    engine.playInterval(EAR_SEMITONES[answer]);
    setPlayed(true);
  };

  const doGuess = (i: number) => {
    if (revealed || !played) return;
    const correct = i === answer;
    setGuess(i);
    setRevealed(true);
    recordDrill('ear', correct);
  };

  const next = () => {
    let a = Math.floor(Math.random() * EAR_SEMITONES.length);
    while (a === answer && EAR_SEMITONES.length > 1) a = Math.floor(Math.random() * EAR_SEMITONES.length);
    setAnswer(a);
    setGuess(null);
    setRevealed(false);
    setPlayed(false);
  };

  const correct = revealed && guess === answer;

  return (
    <PracticeShell title={t.ears.title} subtitle={t.ears.sub} backLabel={t.ears.back} score={state.drills.earScore} streak={state.drills.earStreak} scoreLabel={t.ears.score} streakLabel={t.ears.streak}>
      <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 26 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button
            onClick={play}
            style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 15, padding: '15px 28px', borderRadius: 14, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #93B81F' }}
          >
            <Icon name={played ? 'replay' : 'play_arrow'} size={22} fill /> {played ? t.ears.replay : t.ears.play}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, opacity: played ? 1 : 0.5, pointerEvents: played ? 'auto' : 'none' }}>
          {t.ears.names.map((nm, i) => {
            const isAns = i === answer;
            const isGuess = i === guess;
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
                key={nm}
                onClick={() => doGuess(i)}
                style={{ padding: '15px 16px', borderRadius: 14, border: `1.5px solid ${bd}`, background: bg, color: col, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 14.5, cursor: revealed ? 'default' : 'pointer', textAlign: 'start', transition: 'all .14s' }}
              >
                {nm}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div style={{ marginTop: 22, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: correct ? '#CBF24E' : '#FF5C93', margin: '0 0 14px' }}>
              {correct ? t.ears.correct : `${t.ears.wrong} · ${t.ears.answerWas} ${t.ears.names[answer]}`}
            </p>
            <button
              onClick={next}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14, padding: '11px 20px', borderRadius: 12, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #93B81F' }}
            >
              {t.ears.next} <Icon name="arrow_forward" size={18} />
            </button>
          </div>
        )}
      </div>
    </PracticeShell>
  );
}
