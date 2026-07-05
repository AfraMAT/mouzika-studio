'use client';

import { useEffect, useRef, useState } from 'react';
import { Mixer, MIXER_DEFAULTS, type ChannelState, type MixField } from '@/lib/audio/mixer';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { PracticeShell } from '@/components/app/PracticeShell';

const COLORS = ['#CBF24E', '#4FE3E0', '#8B7CFF', '#FF9A3C', '#CBF24E'];

function panLabel(pan: number): string {
  if (Math.abs(pan) < 0.03) return 'C';
  return pan < 0 ? `L${Math.round(-pan * 100)}` : `R${Math.round(pan * 100)}`;
}

export function MixingDesk() {
  const { t } = useI18n();
  const mixerRef = useRef<Mixer | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const [channels, setChannels] = useState<ChannelState[]>(() => JSON.parse(JSON.stringify(MIXER_DEFAULTS)));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const m = new Mixer();
    mixerRef.current = m;
    m.build(JSON.parse(JSON.stringify(MIXER_DEFAULTS)));
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      m.dispose();
    };
  }, []);

  const meterLoop = () => {
    const m = mixerRef.current;
    if (m) {
      const levels = m.levels();
      levels.forEach((lvl, i) => {
        const el = barsRef.current[i];
        if (el) el.style.height = `${(lvl * 100).toFixed(1)}%`;
      });
    }
    rafRef.current = requestAnimationFrame(meterLoop);
  };

  const toggle = async () => {
    const m = mixerRef.current;
    if (!m) return;
    if (playing) {
      m.stop();
      setPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      barsRef.current.forEach((el) => el && (el.style.height = '2%'));
      return;
    }
    await m.build(channels);
    await m.start();
    setPlaying(true);
    meterLoop();
  };

  const set = (i: number, field: MixField, value: number | boolean) => {
    setChannels((chs) => chs.map((c, j) => (j === i ? { ...c, [field]: value } : c)));
    mixerRef.current?.set(i, field, value);
  };

  const reset = () => {
    const defs = JSON.parse(JSON.stringify(MIXER_DEFAULTS)) as ChannelState[];
    setChannels(defs);
    mixerRef.current?.reset(defs);
  };

  const names = ['Kick', 'Bass', 'Chords', 'Hats', t.mixer.master];
  const btnBase: React.CSSProperties = { width: 30, height: 26, borderRadius: 8, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 11, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)', transition: 'all .12s' };

  return (
    <PracticeShell title={t.mixer.title} subtitle={t.mixer.sub} backLabel={t.mixer.back}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <button
          onClick={toggle}
          style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13.5, border: 'none', borderRadius: 12, padding: '9px 16px', cursor: 'pointer', boxShadow: `0 3px 0 ${playing ? '#b56a26' : '#93B81F'}`, background: playing ? '#FF9A3C' : '#CBF24E', color: '#0A0B10' }}
        >
          <Icon name={playing ? 'stop' : 'play_arrow'} size={19} fill /> {playing ? t.mixer.stop : t.mixer.play}
        </button>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13, color: '#9aa0ad', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 11, padding: '9px 14px', cursor: 'pointer' }}>
          <Icon name="restart_alt" size={17} /> {t.mixer.reset}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
        {channels.map((c, i) => {
          const isMaster = i === 4;
          return (
            <div
              key={c.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 11,
                width: 100,
                flexShrink: 0,
                padding: '16px 10px',
                borderRadius: 16,
                background: isMaster ? 'rgba(203,242,78,0.05)' : '#141620',
                border: `1px solid ${isMaster ? 'rgba(203,242,78,0.2)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              <span style={{ fontSize: 12.5, fontWeight: 700, color: COLORS[i] }}>{names[i]}</span>

              {/* meter + vertical fader */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 150 }}>
                <div style={{ width: 8, height: '100%', background: '#0d0e14', borderRadius: 4, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                  <div ref={(el) => { barsRef.current[i] = el; }} style={{ width: '100%', height: '2%', background: `linear-gradient(to top, ${COLORS[i]}, ${COLORS[i]}aa)`, transition: 'height .05s linear' }} />
                </div>
                <input
                  className="mz-range"
                  type="range"
                  min={-40}
                  max={6}
                  step={0.5}
                  value={c.vol}
                  onChange={(e) => set(i, 'vol', +e.target.value)}
                  aria-label={`${names[i]} volume`}
                  style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 8, height: 150 } as React.CSSProperties}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#8a8f9c' }}>{t.mixer.vol} {(c.vol > 0 ? '+' : '') + c.vol.toFixed(1)}</span>

              {/* pan */}
              <div style={{ width: '100%' }}>
                <input className="mz-range cyan" type="range" min={-1} max={1} step={0.01} value={c.pan} onChange={(e) => set(i, 'pan', +e.target.value)} aria-label={`${names[i]} pan`} style={{ width: '100%' }} />
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#8a8f9c', marginTop: 3 }}>{t.mixer.pan} {panLabel(c.pan)}</div>
              </div>

              {/* mute/solo */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => set(i, 'mute', !c.mute)}
                  aria-label={`${names[i]} mute`}
                  aria-pressed={c.mute}
                  style={{ ...btnBase, background: c.mute ? '#FF5C93' : 'rgba(255,255,255,0.05)', color: c.mute ? '#0A0B10' : '#9aa0ad', borderColor: c.mute ? '#FF5C93' : 'rgba(255,255,255,0.12)' }}
                >
                  M
                </button>
                <button
                  onClick={() => !isMaster && set(i, 'solo', !c.solo)}
                  disabled={isMaster}
                  aria-label={`${names[i]} solo`}
                  aria-pressed={c.solo}
                  style={{ ...btnBase, opacity: isMaster ? 0.25 : 1, pointerEvents: isMaster ? 'none' : 'auto', background: c.solo ? '#FF9A3C' : 'rgba(255,255,255,0.05)', color: c.solo ? '#0A0B10' : '#9aa0ad', borderColor: c.solo ? '#FF9A3C' : 'rgba(255,255,255,0.12)' }}
                >
                  S
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 20, fontSize: 12.5, color: '#6b6f7d', lineHeight: 1.6 }}>{t.mixer.tip}</p>
    </PracticeShell>
  );
}
