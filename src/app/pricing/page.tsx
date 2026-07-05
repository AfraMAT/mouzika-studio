'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from '@/components/ui/EqLogo';

export default function PricingPage() {
  const { t, isRTL } = useI18n();
  const { setPlan } = useProgress();
  const [annual, setAnnual] = useState(true);
  const p = t.plans;
  const proPrice = annual ? '12' : '15';

  const check = (text: string, key: number) => (
    <li key={key} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#c8ccd6', lineHeight: 1.5, marginBottom: 11 }}>
      <Icon name="check_circle" size={18} fill color="#CBF24E" style={{ flexShrink: 0, marginTop: 1 }} />
      {text}
    </li>
  );

  return (
    <div className="dotted-bg" style={{ minHeight: '100vh', background: '#0a0b10', color: '#F4F5F7' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px clamp(14px, 4vw, 28px)' }}>
        <Wordmark size={20} />
        <Link href="/learn" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13.5, padding: '9px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#c8ccd6', textDecoration: 'none' }}>
          <Icon name={isRTL ? 'arrow_forward' : 'arrow_back'} size={18} /> {p.back}
        </Link>
      </header>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '30px 22px 70px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 8vw, 46px)', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 12px' }}>{p.title}</h1>
          <p style={{ fontSize: 17, color: '#9aa0ad', margin: '0 auto', maxWidth: 560, lineHeight: 1.5 }}>{p.sub}</p>
        </div>

        {/* billing toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 34 }}>
          <div style={{ display: 'flex', gap: 4, padding: 5, background: '#111219', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 13 }}>
            {[
              [true, p.annual],
              [false, p.monthly],
            ].map(([val, label]) => {
              const active = annual === val;
              return (
                <button
                  key={String(val)}
                  onClick={() => setAnnual(val as boolean)}
                  style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13.5, transition: 'all .14s', background: active ? '#CBF24E' : 'transparent', color: active ? '#0A0B10' : '#9aa0ad' }}
                >
                  {label as string}
                </button>
              );
            })}
          </div>
        </div>

        {/* plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, alignItems: 'start' }}>
          {/* free */}
          <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{p.freeName}</div>
            <div style={{ fontSize: 13.5, color: '#8a8f9c', marginBottom: 18 }}>{p.freeSub}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40 }}>$0</span>
              <span style={{ fontSize: 14, color: '#8a8f9c' }}>{p.forever}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>{p.freeItems.map((it, i) => check(it, i))}</ul>
            <Link href="/onboarding" onClick={() => setPlan('free')} style={{ display: 'block', textAlign: 'center', fontWeight: 700, fontSize: 15, padding: '13px 0', borderRadius: 13, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.05)', color: '#F4F5F7', textDecoration: 'none' }}>
              {p.freeCta}
            </Link>
          </div>

          {/* pro — most popular */}
          <div style={{ position: 'relative', background: 'linear-gradient(160deg,rgba(203,242,78,0.08),#111219 55%)', border: '1.5px solid rgba(203,242,78,0.4)', borderRadius: 22, padding: 28, boxShadow: '0 20px 50px rgba(203,242,78,0.06)' }}>
            <span style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', background: '#CBF24E', color: '#0A0B10', padding: '5px 13px', borderRadius: 8 }}>
              {p.popular}
            </span>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{p.proName}</div>
            <div style={{ fontSize: 13.5, color: '#8a8f9c', marginBottom: 18 }}>{p.proSub}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, color: '#CBF24E' }}>${proPrice}</span>
              <span style={{ fontSize: 14, color: '#8a8f9c' }}>{p.perMo}</span>
            </div>
            <div style={{ fontSize: 12.5, color: '#6b6f7d', marginBottom: 20 }}>{annual ? p.billedA : p.billedM}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>{p.proItems.map((it, i) => check(it, i))}</ul>
            <button onClick={() => setPlan('pro')} style={{ display: 'block', width: '100%', textAlign: 'center', fontWeight: 700, fontSize: 15, padding: '14px 0', borderRadius: 13, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 5px 0 #7f9f2b' }}>
              {p.proCta}
            </button>
          </div>

          {/* lifetime */}
          <div style={{ background: '#111219', border: '1px solid rgba(139,124,255,0.25)', borderRadius: 22, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>{p.lifeName}</span>
              <Icon name="all_inclusive" size={22} color="#8B7CFF" />
            </div>
            <div style={{ fontSize: 13.5, color: '#8a8f9c', marginBottom: 18 }}>{p.lifeSub}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 40, color: '#c4b9ff' }}>$249</span>
              <span style={{ fontSize: 14, color: '#8a8f9c' }}>{p.once}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 22px' }}>{p.lifeItems.map((it, i) => check(it, i))}</ul>
            <button onClick={() => setPlan('lifetime')} style={{ display: 'block', width: '100%', textAlign: 'center', fontWeight: 700, fontSize: 15, padding: '13px 0', borderRadius: 13, border: '1px solid rgba(139,124,255,0.4)', background: 'rgba(139,124,255,0.12)', color: '#c4b9ff', cursor: 'pointer' }}>
              {p.lifeCta}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 700, margin: '54px auto 0' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 20 }}>{p.faqTitle}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {p.faq.map(([q, a], i) => (
              <div key={i} style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 22px' }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 8 }}>{q}</div>
                <p style={{ fontSize: 14, color: '#9aa0ad', lineHeight: 1.6, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
