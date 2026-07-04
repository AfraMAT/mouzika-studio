'use client';

import { useState } from 'react';
import { getEngine, type Waveform, type SynthParams } from '@/lib/audio/engine';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { Oscilloscope } from './Oscilloscope';
import { PianoKeyboard } from './PianoKeyboard';

const PRESETS: Record<string, SynthParams> = {
  pluck: { wave: 'sawtooth', cutoff: 2400, reso: 5, attack: 0.004, release: 0.3 },
  bass: { wave: 'sawtooth', cutoff: 520, reso: 7, attack: 0.004, release: 0.35 },
  pad: { wave: 'sawtooth', cutoff: 1100, reso: 2, attack: 0.7, release: 1.6 },
  lead: { wave: 'square', cutoff: 3200, reso: 3, attack: 0.02, release: 0.5 },
};

const WAVES: [Waveform, string][] = [
  ['sawtooth', 'SAW'],
  ['square', 'SQR'],
  ['triangle', 'TRI'],
  ['sine', 'SIN'],
];

function Fader({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, color: '#c8ccd6', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#CBF24E' }}>{display}</span>
      </div>
      <input className="mz-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: '100%' }} aria-label={label} />
    </div>
  );
}

export function SynthPlayground() {
  const { t } = useI18n();
  const engine = getEngine();
  const [params, setParams] = useState<SynthParams>({ wave: 'sawtooth', cutoff: 1400, reso: 3, attack: 0.02, release: 0.6 });

  const setWave = (w: Waveform) => {
    engine.setWave(w);
    setParams((p) => ({ ...p, wave: w }));
  };
  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    engine.applyParams(p);
    setParams(p);
  };

  const panel: React.CSSProperties = { background: '#141620', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 18 };
  const eyebrow: React.CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 12 };

  return (
    <div>
      {/* scope */}
      <div style={{ ...panel, marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={eyebrow}>{t.synth.chain}</span>
          <span style={{ fontSize: 12, color: '#6b6f7d' }}>{t.synth.hint}</span>
        </div>
        <Oscilloscope height={120} />
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
        {/* oscillator */}
        <div style={panel}>
          <div style={eyebrow}>{t.synth.osc}</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {WAVES.map(([v, l]) => (
              <button
                key={v}
                onClick={() => setWave(v)}
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '11px 0',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all .12s',
                  background: params.wave === v ? '#CBF24E' : '#171922',
                  color: params.wave === v ? '#0A0B10' : '#8a8f9c',
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12.5, color: '#6b6f7d', lineHeight: 1.5, margin: 0 }}>{t.synth.oscHint}</p>
        </div>

        {/* filter */}
        <div style={panel}>
          <div style={eyebrow}>{t.synth.filter}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Fader
              label={t.synth.cutoff}
              value={params.cutoff}
              display={`${Math.round(params.cutoff)} Hz`}
              min={120}
              max={6000}
              step={1}
              onChange={(v) => {
                engine.setCutoff(v);
                setParams((p) => ({ ...p, cutoff: Math.round(v) }));
              }}
            />
            <Fader
              label={t.synth.reso}
              value={params.reso}
              display={params.reso.toFixed(1)}
              min={0}
              max={15}
              step={0.1}
              onChange={(v) => {
                engine.setReso(v);
                setParams((p) => ({ ...p, reso: Math.round(v * 10) / 10 }));
              }}
            />
          </div>
        </div>

        {/* amp envelope */}
        <div style={panel}>
          <div style={eyebrow}>{t.synth.amp}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Fader
              label={t.synth.attack}
              value={params.attack}
              display={`${Math.round(params.attack * 1000)} ms`}
              min={0.001}
              max={1.5}
              step={0.001}
              onChange={(v) => {
                engine.setAttack(v);
                setParams((p) => ({ ...p, attack: Math.round(v * 1000) / 1000 }));
              }}
            />
            <Fader
              label={t.synth.release}
              value={params.release}
              display={`${params.release.toFixed(2)} s`}
              min={0.05}
              max={2.5}
              step={0.01}
              onChange={(v) => {
                engine.setRelease(v);
                setParams((p) => ({ ...p, release: Math.round(v * 100) / 100 }));
              }}
            />
          </div>
        </div>

        {/* presets */}
        <div style={panel}>
          <div style={eyebrow}>{t.synth.presets}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              ['pluck', t.synth.pluck, 'graphic_eq'],
              ['bass', t.synth.bass, 'speaker'],
              ['pad', t.synth.pad, 'blur_on'],
              ['lead', t.synth.lead, 'auto_awesome'],
            ].map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => applyPreset(key as string)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: '#171922',
                  color: '#c8ccd6',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all .12s',
                }}
              >
                <Icon name={icon as string} size={18} color="#CBF24E" />
                {label as string}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* keyboard */}
      <div style={{ ...panel, marginTop: 16 }}>
        <PianoKeyboard octaves={[3, 4]} height={150} />
      </div>

      <p style={{ fontSize: 13, color: '#8a8f9c', lineHeight: 1.6, marginTop: 16, maxWidth: 640 }}>
        {t.synth.foot1}
        <b style={{ color: '#CBF24E' }}>{t.synth.footCut}</b>
        {t.synth.foot2}
        <b style={{ color: '#CBF24E' }}>{t.synth.footRes}</b>
        {t.synth.foot3}
      </p>
    </div>
  );
}
