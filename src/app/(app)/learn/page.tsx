'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { HOME_UNITS, NODE_WIND } from '@/lib/content/curriculum';
import { Icon } from '@/components/ui/Icon';

export default function LearnPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { state, level, touchToday, hydrated } = useProgress();

  useEffect(() => {
    touchToday();
  }, [touchToday]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', color: '#CBF24E', marginBottom: 4 }}>{t.home.level}</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{t.home.greeting}</h1>
          <p style={{ fontSize: 14, color: '#9aa0ad', margin: '4px 0 0', maxWidth: 420, lineHeight: 1.5 }}>{t.home.sub}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/codex" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 600, fontSize: 13, padding: '9px 14px', borderRadius: 11, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#c8ccd6', textDecoration: 'none' }}>
            <Icon name="menu_book" size={17} /> {t.home.guidebook}
          </Link>
          <Link href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 11, border: 'none', background: 'linear-gradient(120deg,#CBF24E,#a6cc2e)', color: '#0A0B10', textDecoration: 'none' }}>
            <Icon name="bolt" size={16} fill /> {t.dash.goPro}
          </Link>
        </div>
      </div>

      {/* stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <StatCard icon="local_fire_department" color="#FF9A3C" value={hydrated ? String(state.streak) : '·'} label={t.dash.streakDays.replace(/\d+\s*/, '')} />
        <StatCard icon="bolt" color="#CBF24E" value={hydrated ? state.xp.toLocaleString() : '·'} label="XP" />
        <StatCard icon="military_tech" color="#8B7CFF" value={`Lv ${hydrated ? level : '·'}`} label={t.leaderboard.league} />
      </div>

      {/* week streak */}
      <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{t.dash.dailyGoal}</span>
          <span style={{ fontSize: 12.5, color: '#8a8f9c' }}>{t.dash.streakSub}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {t.dash.days.map((d, i) => {
            const active = i < 5;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#CBF24E' : '#171922', color: active ? '#0A0B10' : '#4a4e5a' }}>
                  <Icon name={active ? 'check' : 'circle'} size={active ? 18 : 8} fill />
                </div>
                <span style={{ fontSize: 11, color: '#6b6f7d', fontWeight: 600 }}>{d}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* skill tree */}
      {HOME_UNITS.map((unit, ui) => {
        const ut = t.units[ui];
        return (
          <div key={ui} style={{ marginBottom: 20 }}>
            <div style={{ background: unit.soft, border: `1px solid ${unit.ring}`, borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 15, marginBottom: 28 }}>
              <div style={{ flexShrink: 0, width: 50, height: 50, borderRadius: 14, background: unit.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 0 ${unit.shadow}` }}>
                <Icon name={unit.icon} size={26} color="#0A0B10" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.06em', color: unit.color, marginBottom: 2 }}>{ut.tag}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{ut.title}</div>
                <div style={{ fontSize: 12.5, color: '#8a8f9c' }}>{ut.sub}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              {unit.nodes.map((node, ni) => {
                const tx = NODE_WIND[ni % NODE_WIND.length];
                const isCurrent = node.state === 'current';
                const isDone = node.state === 'done';
                const isLocked = node.state === 'locked';
                const size = node.big ? 74 : 66;
                const icon = isDone ? 'check' : isCurrent ? 'star' : node.keepIcon ? node.icon! : 'lock';
                return (
                  <div key={ni} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11, transform: `translateX(${tx}px)` }}>
                    <button
                      onClick={() => (!isLocked ? router.push('/lesson') : undefined)}
                      disabled={isLocked}
                      style={{
                        position: 'relative',
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        background: isLocked ? '#171922' : unit.color,
                        color: isLocked ? '#3f4457' : '#0A0B10',
                        boxShadow: isLocked ? '0 5px 0 #0e0f15' : isCurrent ? `0 5px 0 ${unit.shadow},0 0 0 7px ${unit.ring}` : `0 5px 0 ${unit.shadow}`,
                        animation: isCurrent ? 'glow 2.2s ease-in-out infinite' : 'none',
                      }}
                    >
                      {isCurrent && (
                        <span style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', background: unit.color, color: '#0A0B10', fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 11.5, letterSpacing: '0.1em', padding: '6px 13px', borderRadius: 9, whiteSpace: 'nowrap', boxShadow: `0 3px 0 ${unit.shadow}` }}>
                          {t.onbq.start.toUpperCase()}
                          <span style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 9, height: 9, background: unit.color }} />
                        </span>
                      )}
                      <Icon name={icon} size={node.big ? 34 : 30} fill />
                    </button>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: isLocked ? '#4a4e5a' : isCurrent ? unit.color : '#cfd3dd', maxWidth: 140, textAlign: 'center', lineHeight: 1.3 }}>{ut.nodes[ni]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon, color, value, label }: { icon: string; color: string; value: string; label: string }) {
  return (
    <div style={{ background: '#111219', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px' }}>
      <Icon name={icon} size={20} fill color={color} />
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginTop: 6 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#8a8f9c' }}>{label}</div>
    </div>
  );
}
