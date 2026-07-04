'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { EqBars, Wordmark } from '@/components/ui/EqLogo';
import { LanguageSwitch } from '@/components/ui/LanguageSwitch';
import { HoverCard } from '@/components/ui/primitives';
import { FEATURE_META, CURRICULUM_TRACKS, AI_STEP_ICONS, FACT_COLORS } from '@/lib/content/curriculum';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="dotted-bg" style={{ minHeight: '100vh', background: '#0a0b10', color: '#F4F5F7', overflowX: 'hidden' }}>
      {/* ---------------- header ---------------- */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '16px 28px', background: 'rgba(10,11,16,0.72)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Wordmark size={21} />
        <nav className="hidden md:flex" style={{ alignItems: 'center', gap: 22 }}>
          {[
            ['#curriculum', t.nav.curriculum],
            ['#interactive', t.nav.interactive],
            ['#ai', t.nav.ai],
            ['/pricing', t.nav.pricing],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ color: '#A7ABB8', textDecoration: 'none', fontSize: 14.5, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {label}
            </a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="hidden sm:block">
            <LanguageSwitch withIcon />
          </div>
          <Link href="/learn" className="hidden sm:inline-flex" style={{ color: '#c8ccd6', textDecoration: 'none', fontSize: 14.5, fontWeight: 600 }}>
            {t.nav.login}
          </Link>
          <Link href="/onboarding" style={{ fontWeight: 700, fontSize: 14, padding: '10px 18px', borderRadius: 12, background: '#CBF24E', color: '#0A0B10', textDecoration: 'none', boxShadow: '0 3px 0 #93B81F' }}>
            {t.nav.start}
          </Link>
        </div>
      </header>

      {/* ---------------- hero ---------------- */}
      <section style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', padding: '60px 24px 40px', display: 'grid', gap: 40, gridTemplateColumns: 'minmax(0,1fr)' }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(203,242,78,0.08)', border: '1px solid rgba(203,242,78,0.2)', borderRadius: 100, padding: '7px 14px', marginBottom: 22 }}>
            <Icon name="auto_awesome" size={15} fill color="#CBF24E" />
            <span style={{ fontSize: 12.5, color: '#CBF24E', fontWeight: 600 }}>{t.hero.badge}</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 66px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0 0 22px' }}>
            {t.hero.t1} <span style={{ color: '#CBF24E' }}>{t.hero.t2}</span> {t.hero.t3}
          </h1>
          <p style={{ fontSize: 18, color: '#A7ABB8', lineHeight: 1.6, margin: '0 0 30px', maxWidth: 600 }}>{t.hero.sub}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 700, fontSize: 16, padding: '15px 26px', borderRadius: 14, background: '#CBF24E', color: '#0A0B10', textDecoration: 'none', boxShadow: '0 5px 0 #7f9f2b' }}>
              <Icon name="rocket_launch" size={20} /> {t.hero.cta1}
            </Link>
            <Link href="/lesson" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 700, fontSize: 16, padding: '15px 26px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)', color: '#F4F5F7', textDecoration: 'none' }}>
              <Icon name="play_circle" size={20} /> {t.hero.cta2}
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[t.hero.tick1, t.hero.tick2, t.hero.tick3].map((tick) => (
              <span key={tick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#8a8f9c' }}>
                <Icon name="check" size={16} color="#CBF24E" /> {tick}
              </span>
            ))}
          </div>
        </div>

        {/* hero visual */}
        <div style={{ position: 'relative', background: 'linear-gradient(160deg,#141620,#0d0e14)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 24, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle,rgba(203,242,78,0.18),transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <EqBars height={22} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#8a8f9c' }}>LESSON · BEATS</span>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 12, color: '#FF9A3C', background: 'rgba(255,154,60,0.12)', padding: '5px 10px', borderRadius: 8 }}>
              <Icon name="local_fire_department" size={14} fill color="#FF9A3C" /> 12 {t.hero.streak}
            </span>
          </div>
          {/* mini step grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { c: '#CBF24E', on: [0, 4, 8, 12] },
              { c: '#FF5C93', on: [4, 12] },
              { c: '#4FE3E0', on: [2, 6, 10, 14] },
            ].map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, aspectRatio: '1', borderRadius: 5, background: row.on.includes(i) ? row.c : '#171922', boxShadow: row.on.includes(i) ? `0 2px 0 ${row.c}66` : 'none' }} />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 11, marginTop: 20, padding: '13px 15px', borderRadius: 13, background: 'rgba(139,124,255,0.08)', border: '1px solid rgba(139,124,255,0.2)' }}>
            <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="auto_awesome" size={16} fill color="#0A0B10" />
            </div>
            <p style={{ fontSize: 13, color: '#c8ccd6', lineHeight: 1.5, margin: 0 }}>{t.hero.tip}</p>
          </div>
        </div>
      </section>

      {/* ---------------- trust ---------------- */}
      <div style={{ textAlign: 'center', padding: '30px 24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.14em', color: '#5a5e6b' }}>{t.trust}</div>
      </div>

      {/* ---------------- facts ---------------- */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {t.facts.map((f, i) => (
            <div key={i} style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 22 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, letterSpacing: '-0.02em', color: FACT_COLORS[i], lineHeight: 1 }}>{f.stat}</div>
              <div style={{ width: 28, height: 3, borderRadius: 2, background: FACT_COLORS[i], margin: '14px 0 12px' }} />
              <p style={{ fontSize: 13.5, color: '#9aa0ad', lineHeight: 1.5, margin: 0 }}>{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- features ---------------- */}
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '50px 24px' }}>
        <SectionHead label={t.feat.label} title={t.feat.t1} accent={t.feat.t2} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 18, marginTop: 34 }}>
          {t.feat.items.map((it, i) => (
            <HoverCard key={i} hoverBorder={FEATURE_META.hover[i]} style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 26 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: FEATURE_META.soft[i], display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                <Icon name={FEATURE_META.icons[i]} size={26} color={FEATURE_META.colors[i]} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, margin: '0 0 8px' }}>{it.title}</h3>
              <p style={{ fontSize: 14, color: '#9aa0ad', lineHeight: 1.6, margin: 0 }}>{it.desc}</p>
            </HoverCard>
          ))}
        </div>
      </section>

      {/* ---------------- interactive ---------------- */}
      <section id="interactive" style={{ maxWidth: 1120, margin: '0 auto', padding: '50px 24px' }}>
        <div className="grid md:grid-cols-2" style={{ gap: 40, alignItems: 'center' }}>
          <div>
            <SectionHead label={t.inter.label} title={t.inter.title} />
            <p style={{ fontSize: 16, color: '#A7ABB8', lineHeight: 1.65, margin: '18px 0 24px', maxWidth: 480 }}>{t.inter.para}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px' }}>
              {t.inter.ticks.map((tick) => (
                <li key={tick} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: '#c8ccd6', marginBottom: 12 }}>
                  <Icon name="check_circle" size={19} fill color="#CBF24E" style={{ flexShrink: 0 }} /> {tick}
                </li>
              ))}
            </ul>
            <Link href="/lesson" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, padding: '13px 22px', borderRadius: 13, background: '#CBF24E', color: '#0A0B10', textDecoration: 'none', boxShadow: '0 4px 0 #93B81F' }}>
              {t.inter.cta} <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
          <div style={{ background: 'linear-gradient(160deg,#141620,#0d0e14)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90, justifyContent: 'center' }}>
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.85, 0.45, 0.75, 0.55, 0.95, 0.5, 0.7].map((h, i) => (
                <div key={i} style={{ width: 10, height: `${h * 100}%`, background: i % 3 === 0 ? '#CBF24E' : 'rgba(203,242,78,0.35)', borderRadius: 4, animation: `eq ${0.8 + (i % 4) * 0.2}s ease-in-out ${-i * 0.1}s infinite`, transformOrigin: 'bottom' }} />
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {['SAW', 'SQR', 'TRI', 'SIN'].map((w, i) => (
                <div key={w} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, padding: '9px 0', borderRadius: 9, background: i === 0 ? '#CBF24E' : '#171922', color: i === 0 ? '#0A0B10' : '#8a8f9c' }}>
                  {w}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- curriculum ---------------- */}
      <section id="curriculum" style={{ maxWidth: 1120, margin: '0 auto', padding: '50px 24px' }}>
        <SectionHead label={t.curr.label} title={t.curr.title} centered />
        <p style={{ fontSize: 16, color: '#A7ABB8', lineHeight: 1.6, margin: '18px auto 34px', maxWidth: 560, textAlign: 'center' }}>{t.curr.para}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {t.curr.tracks.map((track, i) => {
            const isAi = i === 7;
            const meta = CURRICULUM_TRACKS[i] ?? { icon: 'auto_awesome', color: '#8B7CFF', soft: 'rgba(139,124,255,0.12)', count: '7' };
            return (
              <HoverCard key={i} hoverBorder={`${meta.color}55`} style={{ position: 'relative', background: isAi ? 'linear-gradient(160deg,rgba(139,124,255,0.1),#111219 60%)' : '#111219', border: `1px solid ${isAi ? 'rgba(139,124,255,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 18, padding: 22 }}>
                {isAi && <span style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', background: '#8B7CFF', color: '#0A0B10', padding: '3px 8px', borderRadius: 5 }}>{t.curr.newBadge}</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: isAi ? 'rgba(139,124,255,0.12)' : meta.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={isAi ? 'auto_awesome' : meta.icon} size={22} color={isAi ? '#8B7CFF' : meta.color} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b6f7d' }}>{isAi ? '7' : meta.count} {t.curr.lessons}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>{track.title}</h3>
                <p style={{ fontSize: 13.5, color: '#9aa0ad', lineHeight: 1.5, margin: 0 }}>{track.desc}</p>
              </HoverCard>
            );
          })}
        </div>
      </section>

      {/* ---------------- AI band ---------------- */}
      <section id="ai" style={{ maxWidth: 1120, margin: '0 auto', padding: '50px 24px' }}>
        <div style={{ background: 'linear-gradient(160deg,rgba(139,124,255,0.08),#0d0e14 70%)', border: '1px solid rgba(139,124,255,0.2)', borderRadius: 26, padding: 'clamp(28px,5vw,48px)' }}>
          <SectionHead label={t.aiband.label} title={t.aiband.title} labelColor="#8B7CFF" centered />
          <p style={{ fontSize: 16, color: '#A7ABB8', lineHeight: 1.6, margin: '18px auto 36px', maxWidth: 560, textAlign: 'center' }}>{t.aiband.para}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
            {t.aiband.steps.map((step, i) => (
              <div key={i} style={{ background: 'rgba(17,18,25,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(139,124,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={AI_STEP_ICONS[i]} size={22} color="#8B7CFF" />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: 'rgba(139,124,255,0.35)' }}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16.5, fontWeight: 700, margin: '0 0 6px' }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: '#9aa0ad', lineHeight: 1.55, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '50px 24px 70px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px,5vw,46px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.08, margin: '0 0 16px' }}>
          {t.cta.t1} <span style={{ color: '#CBF24E' }}>{t.cta.t2}</span>
        </h2>
        <p style={{ fontSize: 17, color: '#A7ABB8', margin: '0 auto 28px', maxWidth: 480, lineHeight: 1.5 }}>{t.cta.para}</p>
        <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 17, padding: '16px 32px', borderRadius: 16, background: '#CBF24E', color: '#0A0B10', textDecoration: 'none', boxShadow: '0 5px 0 #7f9f2b' }}>
          <Icon name="rocket_launch" size={22} /> {t.cta.btn}
        </Link>
      </section>

      {/* ---------------- footer ---------------- */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 30 }}>
          <div style={{ minWidth: 200 }}>
            <Wordmark size={20} />
            <p style={{ fontSize: 13.5, color: '#8a8f9c', lineHeight: 1.6, margin: '14px 0 0', maxWidth: 280 }}>{t.footer.tagline}</p>
          </div>
          {[
            { heading: t.footer.product, links: t.footer.productLinks },
            { heading: t.footer.learn, links: t.footer.learnLinks },
            { heading: t.footer.company, links: t.footer.companyLinks },
          ].map((col) => (
            <div key={col.heading}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#6b6f7d', marginBottom: 14 }}>{col.heading}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <span style={{ fontSize: 14, color: '#9aa0ad', cursor: 'pointer' }}>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 1120, margin: '30px auto 0', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6b6f7d' }}>{t.footer.madeby}</span>
          <LanguageSwitch withIcon />
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ label, title, accent, centered, labelColor = '#CBF24E' }: { label: string; title: string; accent?: string; centered?: boolean; labelColor?: string }) {
  return (
    <div style={{ textAlign: centered ? 'center' : 'start' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: labelColor, marginBottom: 12 }}>{label}</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,4vw,38px)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
        {title}
        {accent && (
          <>
            {' '}
            <span style={{ color: '#CBF24E' }}>{accent}</span>
          </>
        )}
      </h2>
    </div>
  );
}
