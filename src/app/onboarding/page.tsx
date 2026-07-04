'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { Icon } from '@/components/ui/Icon';
import { EqBars } from '@/components/ui/EqLogo';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';

type Key = 'goal' | 'genre' | 'level' | 'time';

const STEP_META: { key: Key; cols: number; opts: { icon: string; color: string; value: string | number }[] }[] = [
  { key: 'goal', cols: 1, opts: [
    { icon: 'music_note', color: '#CBF24E', value: 'first' },
    { icon: 'equalizer', color: '#4FE3E0', value: 'mixing' },
    { icon: 'tune', color: '#FF5C93', value: 'sound' },
    { icon: 'auto_awesome', color: '#8B7CFF', value: 'ai' },
  ] },
  { key: 'genre', cols: 2, opts: [
    { icon: 'album', color: '#CBF24E', value: 'house' },
    { icon: 'blur_on', color: '#4FE3E0', value: 'techno' },
    { icon: 'graphic_eq', color: '#8B7CFF', value: 'melodic' },
    { icon: 'surround_sound', color: '#FF5C93', value: 'dubstep' },
    { icon: 'bolt', color: '#FF9A3C', value: 'dnb' },
    { icon: 'speaker', color: '#CBF24E', value: 'trap' },
  ] },
  { key: 'level', cols: 1, opts: [
    { icon: 'eco', color: '#CBF24E', value: 'beginner' },
    { icon: 'trending_up', color: '#4FE3E0', value: 'some' },
    { icon: 'rocket_launch', color: '#8B7CFF', value: 'inter' },
  ] },
  { key: 'time', cols: 2, opts: [
    { icon: 'bolt', color: '#CBF24E', value: 5 },
    { icon: 'local_fire_department', color: '#FF9A3C', value: 10 },
    { icon: 'rocket_launch', color: '#8B7CFF', value: 15 },
    { icon: 'workspace_premium', color: '#FF5C93', value: 30 },
  ] },
];

export default function OnboardingPage() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { setOnboarding } = useProgress();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<Key, string | number | null>>({ goal: null, genre: null, level: null, time: null });

  const ready = step >= STEP_META.length;
  const meta = ready ? null : STEP_META[step];
  const stepDict = ready ? null : t.onbq.steps[step];
  const selected = meta ? answers[meta.key] : null;

  const back = () => {
    if (step === 0) router.push('/');
    else setStep((s) => s - 1);
  };
  const next = () => setStep((s) => s + 1);
  const finish = () => {
    setOnboarding({
      goal: answers.goal as string | null,
      genre: answers.genre as string | null,
      level: answers.level as string | null,
      time: answers.time as number | null,
    });
    router.push('/learn');
  };

  return (
    <div className="dotted-bg" style={{ minHeight: '100vh', background: '#0a0b10', color: '#F4F5F7', display: 'flex', flexDirection: 'column' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px' }}>
        <button onClick={back} aria-label="Back" style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.06)', color: '#c8ccd6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={isRTL ? 'arrow_forward' : 'arrow_back'} size={20} />
        </button>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          {STEP_META.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 100, background: i <= step ? '#CBF24E' : '#22242e', transition: 'background .2s' }} />
          ))}
        </div>
        <EqBars height={18} barW={3} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px 22px 40px', maxWidth: 620, width: '100%', margin: '0 auto' }}>
        {!ready && meta && stepDict ? (
          <div className="anim-rise" key={step}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>{stepDict.title}</h1>
            <p style={{ fontSize: 15, color: '#9aa0ad', margin: '0 0 26px' }}>{stepDict.sub}</p>

            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${meta.cols},1fr)`, gap: 12 }}>
              {meta.opts.map((o, oi) => {
                const active = selected === o.value;
                const [label, desc] = stepDict.options[oi];
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [meta.key]: o.value }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 15,
                      width: '100%',
                      textAlign: 'start',
                      padding: '17px 19px',
                      borderRadius: 16,
                      cursor: 'pointer',
                      transition: 'all .14s',
                      background: active ? 'rgba(203,242,78,0.09)' : '#111219',
                      border: `1.5px solid ${active ? '#CBF24E' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? o.color : 'rgba(255,255,255,0.05)' }}>
                      <Icon name={o.icon} size={24} color={active ? '#0A0B10' : o.color} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 15.5 }}>{label}</span>
                      <span style={{ display: 'block', fontSize: 13, color: '#8a8f9c', marginTop: 2 }}>{desc}</span>
                    </span>
                    <Icon name={active ? 'check_circle' : 'radio_button_unchecked'} size={22} fill={active} color={active ? '#CBF24E' : '#2a2d38'} />
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              disabled={selected == null}
              style={{ marginTop: 26, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 700, fontSize: 16, padding: '15px 0', borderRadius: 14, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: selected == null ? 'default' : 'pointer', opacity: selected == null ? 0.4 : 1, boxShadow: selected == null ? 'none' : '0 4px 0 #93B81F' }}
            >
              {t.onbq.continueBtn} <Icon name={isRTL ? 'arrow_back' : 'arrow_forward'} size={20} />
            </button>
          </div>
        ) : (
          <div className="anim-rise" style={{ textAlign: 'center' }}>
            <div style={{ width: 86, height: 86, borderRadius: 24, background: 'linear-gradient(135deg,#CBF24E,#a6cc2e)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 0 #7f9f2b', marginBottom: 22 }}>
              <Icon name="check" size={46} color="#0A0B10" />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 12px' }}>{t.onbq.readyTitle}</h1>
            <p style={{ fontSize: 15.5, color: '#9aa0ad', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: 460 }}>{t.onbq.readySub}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
              {[t.onbq.tag12, t.onbq.tagHouse, t.onbq.tagBeg, t.onbq.tagTime].map((tag) => (
                <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#CBF24E', background: 'rgba(203,242,78,0.1)', border: '1px solid rgba(203,242,78,0.22)', padding: '7px 14px', borderRadius: 100 }}>
                  {tag}
                </span>
              ))}
            </div>
            <button onClick={finish} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, padding: '16px 34px', borderRadius: 16, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 5px 0 #7f9f2b' }}>
              {t.onbq.start} <Icon name="arrow_forward" size={22} />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 0 24px' }}>
        <LanguageSwitch withIcon />
      </div>
    </div>
  );
}
