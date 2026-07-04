'use client';

import { useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { decodeFile, analyzeBuffer, renderDemoLoop, type MixMetrics } from '@/lib/audio/analyze';
import { buildReport, type MixReport } from '@/lib/audio/feedback';
import { Icon } from '@/components/ui/Icon';

export function FeedbackAnalyzer() {
  const { t, locale } = useI18n();
  const { addXp } = useProgress();
  const [state, setState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [fileName, setFileName] = useState('');
  const [metrics, setMetrics] = useState<MixMetrics | null>(null);
  const [report, setReport] = useState<MixReport | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);

  const run = async (buffer: AudioBuffer, name: string) => {
    setError('');
    setState('analyzing');
    setFileName(name);
    // let the UI paint the analyzing state
    await new Promise((r) => setTimeout(r, 60));
    try {
      const m = analyzeBuffer(buffer);
      const rep = buildReport(m, locale);
      setMetrics(m);
      setReport(rep);
      setState('done');
      addXp(15);
    } catch {
      setError('Could not analyse that file.');
      setState('idle');
    }
  };

  const handleFile = async (file: File) => {
    try {
      setState('analyzing');
      setFileName(file.name);
      const buffer = await decodeFile(file);
      await run(buffer, file.name);
    } catch {
      setError('Could not decode that audio file. Try a WAV, MP3 or FLAC.');
      setState('idle');
    }
  };

  const useDemo = async () => {
    setState('analyzing');
    setFileName('demo-loop.wav');
    try {
      const buffer = await renderDemoLoop();
      await run(buffer, 'demo-loop.wav');
    } catch {
      setError('Could not render the demo loop.');
      setState('idle');
    }
  };

  const reset = () => {
    setState('idle');
    setMetrics(null);
    setReport(null);
    setFileName('');
    setError('');
  };

  if (state === 'done' && metrics && report) {
    return <Result t={t} metrics={metrics} report={report} fileName={fileName} onReset={reset} />;
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        style={{
          border: `2px dashed ${drag ? '#CBF24E' : 'rgba(255,255,255,0.14)'}`,
          borderRadius: 22,
          padding: '46px 26px',
          textAlign: 'center',
          background: drag ? 'rgba(203,242,78,0.05)' : '#111219',
          transition: 'all .15s',
        }}
      >
        {state === 'analyzing' ? (
          <div>
            <Icon name="graphic_eq" size={44} color="#CBF24E" style={{ animation: 'flicker 1s ease-in-out infinite' }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginTop: 14 }}>{t.feedbackui.analyzing}</p>
            <p style={{ fontSize: 13, color: '#6b6f7d', marginTop: 4 }}>{fileName}</p>
          </div>
        ) : (
          <>
            <div style={{ width: 66, height: 66, borderRadius: 18, background: 'rgba(203,242,78,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="upload_file" size={32} color="#CBF24E" />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>{t.feedbackui.drop}</p>
            <p style={{ fontSize: 13, color: '#8a8f9c', margin: '0 0 20px', lineHeight: 1.5 }}>{t.feedbackui.dropSub}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => inputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, padding: '11px 20px', borderRadius: 12, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #93B81F' }}>
                <Icon name="folder_open" size={18} /> {t.feedbackui.browse}
              </button>
              <button onClick={useDemo} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, padding: '11px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#c8ccd6', cursor: 'pointer' }}>
                <Icon name="play_circle" size={18} /> {t.feedbackui.demo}
              </button>
            </div>
            <input ref={inputRef} type="file" accept="audio/*" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </>
        )}
      </div>
      {error && <p style={{ color: '#FF5C93', fontSize: 13.5, marginTop: 12, textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - score / 100);
  const color = score >= 80 ? '#CBF24E' : score >= 60 ? '#FF9A3C' : '#FF5C93';
  return (
    <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
      <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition: 'stroke-dashoffset .6s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, color }}>{score}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#8a8f9c' }}>/ 100</span>
      </div>
    </div>
  );
}

function Result({ t, metrics, report, fileName, onReset }: { t: ReturnType<typeof useI18n>['t']; metrics: MixMetrics; report: MixReport; fileName: string; onReset: () => void }) {
  const bar = (label: string, value: string, frac: number, color: string) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
        <span style={{ color: '#9aa0ad' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: '#e4e7ee' }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.max(3, Math.min(100, frac * 100))}%`, background: color, borderRadius: 100 }} />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: 24, marginBottom: 16, flexWrap: 'wrap' }}>
        <ScoreRing score={report.score} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 4 }}>{t.feedbackui.scoreLabel}</div>
          <div style={{ fontSize: 15, color: '#c8ccd6', marginBottom: 4 }}>{fileName}</div>
          <div style={{ fontSize: 12.5, color: '#6b6f7d' }}>{metrics.durationSec.toFixed(1)}s · {metrics.mono ? 'mono' : 'stereo'}</div>
        </div>
        <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 13.5, padding: '10px 16px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#c8ccd6', cursor: 'pointer' }}>
          <Icon name="refresh" size={17} /> {t.feedbackui.again}
        </button>
      </div>

      {/* metrics */}
      <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 22, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 16 }}>{t.feedbackui.metrics}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18 }}>
          {bar(t.feedbackui.lufsM, `${metrics.lufs.toFixed(1)} LUFS`, (metrics.lufs + 30) / 30, metrics.lufs >= -15 && metrics.lufs <= -13 ? '#CBF24E' : '#FF9A3C')}
          {bar(t.feedbackui.peakM, `${metrics.peakDb.toFixed(1)} dB`, (metrics.peakDb + 12) / 12, metrics.peakDb <= -1 ? '#CBF24E' : '#FF5C93')}
          {bar(t.feedbackui.widthM, metrics.mono ? 'mono' : `${Math.round(metrics.width * 100)}%`, metrics.width, '#4FE3E0')}
          {bar(t.feedbackui.crestM, `${metrics.crest.toFixed(1)} dB`, metrics.crest / 24, metrics.crest >= 6 ? '#CBF24E' : '#FF9A3C')}
        </div>
        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 12.5, color: '#9aa0ad', marginBottom: 8 }}>{t.feedbackui.balanceM}</div>
          <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ width: `${metrics.balance.low * 100}%`, background: '#8B7CFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#0A0B10' }}>{Math.round(metrics.balance.low * 100)}</div>
            <div style={{ width: `${metrics.balance.mid * 100}%`, background: '#4FE3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#0A0B10' }}>{Math.round(metrics.balance.mid * 100)}</div>
            <div style={{ width: `${metrics.balance.high * 100}%`, background: '#CBF24E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#0A0B10' }}>{Math.round(metrics.balance.high * 100)}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9.5, color: '#6b6f7d', marginTop: 4 }}>
            <span>LOW</span>
            <span>MID</span>
            <span>HIGH</span>
          </div>
        </div>
      </div>

      {/* findings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        {report.fixes.length > 0 && (
          <div style={{ background: '#111219', border: '1px solid rgba(255,92,147,0.2)', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="build" size={19} color="#FF9A3C" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t.feedbackui.fixesTitle}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {report.fixes.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: '#c8ccd6', lineHeight: 1.5 }}>
                  <Icon name="chevron_right" size={18} color="#FF9A3C" style={{ flexShrink: 0, marginTop: 1 }} />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.strengths.length > 0 && (
          <div style={{ background: '#111219', border: '1px solid rgba(203,242,78,0.2)', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="verified" size={19} color="#CBF24E" fill />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{t.feedbackui.strengthsTitle}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {report.strengths.map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: '#c8ccd6', lineHeight: 1.5 }}>
                  <Icon name="check" size={18} color="#CBF24E" style={{ flexShrink: 0, marginTop: 1 }} />
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p style={{ fontSize: 11.5, color: '#5a5e6b', textAlign: 'center', marginTop: 18, lineHeight: 1.6 }}>{t.feedbackui.disclaimer}</p>
    </div>
  );
}
