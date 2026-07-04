'use client';

import { useEffect, useRef, useState } from 'react';
import { LufsMeter as LufsGraph, lufsReadout } from '@/lib/audio/lufs';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { PracticeShell } from '@/components/app/PracticeShell';

export function LufsMeter() {
  const { t } = useI18n();
  const graphRef = useRef<LufsGraph | null>(null);
  const [gain, setGain] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const g = new LufsGraph();
    graphRef.current = g;
    g.build(-1);
    return () => g.dispose();
  }, []);

  const toggle = async () => {
    const g = graphRef.current;
    if (!g) return;
    if (playing) {
      g.stop();
      setPlaying(false);
      return;
    }
    await g.build(gain);
    await g.start();
    setPlaying(true);
  };

  const r = lufsReadout(gain);
  const color = r.inRange ? '#CBF24E' : r.tooHot ? '#FF5C93' : '#4FE3E0';
  const feedback = r.inRange ? t.lufs.inRange : r.tooHot ? t.lufs.tooHot : t.lufs.tooLow;
  const fbIcon = r.inRange ? 'check_circle' : r.tooHot ? 'warning' : 'trending_up';
  const fbBg = r.inRange ? 'rgba(203,242,78,0.08)' : r.tooHot ? 'rgba(255,92,147,0.08)' : 'rgba(79,227,224,0.07)';
  const fbBorder = r.inRange ? 'rgba(203,242,78,0.28)' : r.tooHot ? 'rgba(255,92,147,0.28)' : 'rgba(79,227,224,0.2)';
  const pct = Math.max(2, Math.min(100, ((r.integrated + 30) / 30) * 100));

  const stat = (label: string, value: string, col = '#F4F5F7') => (
    <div style={{ flex: 1, background: '#141620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: '#8a8f9c', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: col }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5a5e6b', marginTop: 2 }}>LUFS</div>
    </div>
  );

  return (
    <PracticeShell title={t.lufs.title} subtitle={t.lufs.sub} backLabel={t.lufs.back}>
      <div style={{ display: 'flex', marginBottom: 18 }}>
        <button
          onClick={toggle}
          style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 13.5, border: 'none', borderRadius: 12, padding: '9px 16px', cursor: 'pointer', boxShadow: `0 3px 0 ${playing ? '#b56a26' : '#93B81F'}`, background: playing ? '#FF9A3C' : '#CBF24E', color: '#0A0B10' }}
        >
          <Icon name={playing ? 'stop' : 'play_arrow'} size={19} fill /> {playing ? t.lufs.stop : t.lufs.play}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        {stat(t.lufs.integrated, r.integrated.toFixed(1), color)}
        {stat(t.lufs.momentary, r.momentary.toFixed(1))}
        {stat(t.lufs.truePeak, r.peak.toFixed(1), r.peak > -1 ? '#FF5C93' : '#c8ccd6')}
      </div>

      {/* meter bar */}
      <div style={{ position: 'relative', height: 26, background: '#0d0e14', borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
        {/* target pocket highlight (−15..−13 → maps into 0..100 scale) */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${((-15 + 30) / 30) * 100}%`, width: `${(2 / 30) * 100}%`, background: 'rgba(203,242,78,0.18)', borderInline: '1px dashed rgba(203,242,78,0.5)' }} />
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width .1s, background .2s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5a5e6b', marginBottom: 22 }}>
        <span>−30</span>
        <span style={{ color: '#CBF24E' }}>−14 · {t.lufs.target}</span>
        <span>0</span>
      </div>

      {/* gain fader */}
      <div style={{ background: '#141620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#c8ccd6' }}>{t.lufs.gain}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color }}>{(gain > 0 ? '+' : '') + gain.toFixed(1)} dB</span>
        </div>
        <input
          className="mz-range"
          type="range"
          min={-12}
          max={6}
          step={0.1}
          value={gain}
          onChange={(e) => {
            const v = +e.target.value;
            setGain(v);
            graphRef.current?.setGain(v);
          }}
          style={{ width: '100%' }}
          aria-label={t.lufs.gain}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: fbBg, border: `1px solid ${fbBorder}` }}>
        <Icon name={fbIcon} size={22} fill color={color} />
        <span style={{ fontSize: 14, color: '#e4e7ee', lineHeight: 1.5 }}>{feedback}</span>
      </div>
    </PracticeShell>
  );
}
