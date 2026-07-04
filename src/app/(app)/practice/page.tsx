'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { Icon } from '@/components/ui/Icon';
import { HoverCard } from '@/components/ui/primitives';

const TOOLS = [
  { icon: 'equalizer', color: '#CBF24E', href: '/practice/eq' },
  { icon: 'music_note', color: '#4FE3E0', href: '/practice/chords' },
  { icon: 'hearing', color: '#FF9A3C', href: '/practice/ear' },
  { icon: 'tune', color: '#8B7CFF', href: '/practice/mixer' },
  { icon: 'graphic_eq', color: '#FF5C93', href: '/practice/lufs' },
  { icon: 'architecture', color: '#CBF24E', href: '/practice/arrange' },
];

export default function PracticePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { state, dueCount, hydrated } = useProgress();
  const due = hydrated ? dueCount() : 0;

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 8px' }}>{t.practice.title}</h1>
      <p style={{ fontSize: 15, color: '#9aa0ad', lineHeight: 1.6, margin: '0 0 26px', maxWidth: 620 }}>{t.practice.sub}</p>

      {/* daily drill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: 'linear-gradient(120deg,rgba(203,242,78,0.1),rgba(139,124,255,0.06))', border: '1px solid rgba(203,242,78,0.22)', borderRadius: 20, padding: 22, marginBottom: 26, flexWrap: 'wrap' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#CBF24E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 0 #7f9f2b', flexShrink: 0 }}>
          <Icon name="bolt" size={30} fill color="#0A0B10" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19 }}>{t.practice.daily}</div>
          <div style={{ fontSize: 13.5, color: '#9aa0ad', marginTop: 2 }}>
            {t.practice.dailyDesc}
            {due > 0 ? ` · ${due} due` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 13, color: '#FF9A3C', background: 'rgba(255,154,60,0.12)', padding: '8px 14px', borderRadius: 10 }}>
          <Icon name="local_fire_department" size={16} fill color="#FF9A3C" /> {hydrated ? state.streak : '·'} {t.practice.streak}
        </div>
        <button onClick={() => router.push('/practice/eq')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 14, padding: '11px 20px', borderRadius: 12, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #93B81F' }}>
          {t.practice.start} <Icon name="arrow_forward" size={18} />
        </button>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#8a8f9c', marginBottom: 14 }}>{t.practice.toolsLabel}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
        {TOOLS.map((tool, i) => (
          <HoverCard
            key={tool.href}
            hoverBorder={`${tool.color}55`}
            onClick={() => router.push(tool.href)}
            style={{ textAlign: 'start', width: '100%', background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 22, cursor: 'pointer' }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${tool.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name={tool.icon} size={25} color={tool.color} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{t.practice.tools[i].name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em', padding: '4px 9px', borderRadius: 6, background: tool.color, color: '#0A0B10' }}>{t.practice.open}</span>
            </div>
            <p style={{ fontSize: 13.5, color: '#9aa0ad', lineHeight: 1.5, margin: 0 }}>{t.practice.tools[i].desc}</p>
          </HoverCard>
        ))}
      </div>
    </div>
  );
}
