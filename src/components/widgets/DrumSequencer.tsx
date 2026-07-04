'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getEngine, type DrumTrack, type Pattern } from '@/lib/audio/engine';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';

const DEFAULT_PATTERN: Pattern = {
  kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
  clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  hat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
  perc: Array(16).fill(false),
};

const COLORS: Record<DrumTrack, string> = { kick: '#CBF24E', clap: '#FF5C93', hat: '#4FE3E0', perc: '#FF9A3C' };
const SHADOWS: Record<DrumTrack, string> = { kick: '#7f9f2b', clap: '#a83c63', hat: '#2f8f8d', perc: '#b56a26' };

const TRACKS: DrumTrack[] = ['kick', 'clap', 'hat', 'perc'];

export function DrumSequencer({ tracks = TRACKS, onEdited }: { tracks?: DrumTrack[]; onEdited?: () => void }) {
  const { t } = useI18n();
  const engine = getEngine();
  const [pattern, setPattern] = useState<Pattern>(() => JSON.parse(JSON.stringify(DEFAULT_PATTERN)));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [bpm, setBpm] = useState(124);
  const patternRef = useRef(pattern);
  patternRef.current = pattern;

  useEffect(() => {
    return () => {
      engine.stopSequencer();
    };
  }, [engine]);

  const toggle = useCallback(async () => {
    if (playing) {
      engine.stopSequencer();
      setPlaying(false);
      setStep(-1);
      return;
    }
    await engine.startSequencer(() => patternRef.current, bpm, (s) => setStep(s));
    setPlaying(true);
  }, [engine, playing, bpm]);

  const toggleCell = (track: DrumTrack, i: number) => {
    setPattern((p) => {
      const arr = p[track].slice();
      arr[i] = !arr[i];
      return { ...p, [track]: arr };
    });
    onEdited?.();
  };

  const clear = () => {
    engine.stopSequencer();
    setPlaying(false);
    setStep(-1);
    setPattern({ kick: Array(16).fill(false), clap: Array(16).fill(false), hat: Array(16).fill(false), perc: Array(16).fill(false) });
  };

  const rowLabels: Record<DrumTrack, string> = { kick: t.lesson.rows[0], clap: t.lesson.rows[1], hat: t.lesson.rows[2], perc: t.lesson.rows[3] };

  return (
    <div
      style={{
        background: '#141620',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20,
        padding: 22,
      }}
    >
      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
        <button
          onClick={toggle}
          aria-label={playing ? t.mixer.stop : t.mixer.play}
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            border: 'none',
            background: '#CBF24E',
            color: '#0A0B10',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 5px 0 #7f9f2b',
            flexShrink: 0,
          }}
        >
          <Icon name={playing ? 'pause' : 'play_arrow'} size={30} fill />
        </button>

        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c' }}>{t.lesson.tempo}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26 }}>{bpm}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#8a8f9c' }}>BPM</span>
          </div>
        </div>

        <input
          className="mz-range"
          type="range"
          min={90}
          max={175}
          value={bpm}
          onChange={(e) => {
            const v = +e.target.value;
            setBpm(v);
            engine.setBpm(v);
          }}
          style={{ width: 150 }}
          aria-label="Tempo"
        />

        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#CBF24E',
            background: 'rgba(203,242,78,0.12)',
            padding: '6px 11px',
            borderRadius: 8,
          }}
        >
          HOUSE
        </span>

        <button
          onClick={clear}
          style={{
            marginInlineStart: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: 13,
            color: '#9aa0ad',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10,
            padding: '9px 14px',
            cursor: 'pointer',
          }}
        >
          <Icon name="delete_sweep" size={17} /> {t.lesson.clear}
        </button>
      </div>

      {/* beat numbers */}
      <div style={{ display: 'flex', gap: 10, marginInlineStart: 62, marginBottom: 8 }}>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} style={{ flex: 1, display: 'flex', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5a5e6b' }}>{n}</span>
          </div>
        ))}
      </div>

      {/* rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tracks.map((track) => (
          <div key={track} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => engine.triggerDrum(track)}
              title={rowLabels[track]}
              style={{
                width: 52,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#cfd3dd',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: COLORS[track], flexShrink: 0 }} />
              <span style={{ overflow: 'hidden' }}>{rowLabels[track]}</span>
            </button>
            <div style={{ display: 'flex', gap: 10, flex: 1 }}>
              {[0, 1, 2, 3].map((g) => (
                <div key={g} style={{ display: 'flex', gap: 5, flex: 1 }}>
                  {pattern[track].slice(g * 4, g * 4 + 4).map((active, ci) => {
                    const i = g * 4 + ci;
                    const isStep = step === i;
                    return (
                      <button
                        key={i}
                        onClick={() => toggleCell(track, i)}
                        aria-label={`${rowLabels[track]} step ${i + 1}`}
                        aria-pressed={active}
                        style={{
                          flex: 1,
                          aspectRatio: '1',
                          minHeight: 26,
                          borderRadius: 7,
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'transform .06s, box-shadow .1s',
                          background: active ? COLORS[track] : isStep ? '#23262f' : '#171922',
                          boxShadow: active ? `0 3px 0 ${SHADOWS[track]}` : '0 3px 0 #0d0e14',
                          outline: isStep ? `2px solid ${active ? '#fff' : 'rgba(255,255,255,0.4)'}` : 'none',
                          outlineOffset: isStep ? 1 : 0,
                          transform: active && isStep ? 'translateY(1px) scale(1.04)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
