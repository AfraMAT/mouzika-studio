'use client';

import { LEADERBOARD, MEDAL_COLORS } from '@/lib/content/community';
import { ACHIEVEMENTS } from '@/lib/content/curriculum';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';

const SURFACE = '#111219';
const INK = '#F4F5F7';
const MUTED = '#9aa0ad';
const MUTED2 = '#6b6f7d';
const GOLD = '#FFD35C';
const LIME = '#CBF24E';
const PINK = '#FF5C93';

export default function LeaderboardPage() {
  const { t } = useI18n();
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 60px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
          color: INK,
        }}
      >
        {t.leaderboard.title}
      </h1>
      <p
        style={{
          fontSize: 15,
          color: MUTED,
          lineHeight: 1.6,
          maxWidth: 620,
          margin: '0 0 22px',
        }}
      >
        {t.leaderboard.sub}
      </p>

      {/* LEAGUE HEADER */}
      <div
        style={{
          background: 'linear-gradient(120deg,rgba(255,211,92,0.1),rgba(203,242,78,0.05))',
          border: '1px solid rgba(255,211,92,0.25)',
          borderRadius: 18,
          padding: 20,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icon name="emoji_events" color={GOLD} size={30} fill />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 18,
                color: INK,
              }}
            >
              {t.leaderboard.league}
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: LIME,
                }}
              >
                <Icon name="trending_up" color={LIME} size={13} />
                {t.leaderboard.promo}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: PINK,
                }}
              >
                <Icon name="trending_down" color={PINK} size={13} />
                {t.leaderboard.demote}
              </span>
            </div>
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#c8ccd6',
            background: 'rgba(255,255,255,0.05)',
            padding: '8px 13px',
            borderRadius: 10,
          }}
        >
          <Icon name="schedule" color="#c8ccd6" size={14} />
          {t.leaderboard.resetIn}
        </span>
      </div>

      {/* RANKED LIST */}
      <div
        style={{
          background: SURFACE,
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 18,
          overflow: 'hidden',
          marginBottom: 28,
        }}
      >
        {LEADERBOARD.map((row, i) => {
          const rank = i + 1;
          const isLast = i === LEADERBOARD.length - 1;
          const rankColor = i < 3 ? MEDAL_COLORS[i] : row.you ? LIME : MUTED2;
          return (
            <div
              key={row.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderBottom: isLast ? undefined : '1px solid rgba(255,255,255,0.05)',
                background: row.you ? 'rgba(203,242,78,0.07)' : undefined,
                boxShadow: rank === 7 ? 'inset 0 -2px 0 rgba(203,242,78,0.3)' : undefined,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  width: 34,
                  color: rankColor,
                }}
              >
                {`#${rank}`}
              </span>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: row.c,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#0A0B10',
                  }}
                >
                  {row.initial}
                </span>
              </div>
              <span
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 600,
                  fontSize: 14.5,
                  color: row.you ? LIME : INK,
                }}
              >
                {row.name}
                {row.you && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      fontWeight: 700,
                      background: LIME,
                      color: '#0A0B10',
                      padding: '2px 7px',
                      borderRadius: 5,
                      marginInlineStart: 8,
                    }}
                  >
                    {t.leaderboard.you}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: '#c8ccd6',
                }}
              >
                {`${row.xp.toLocaleString()} XP`}
              </span>
            </div>
          );
        })}
      </div>

      {/* ACHIEVEMENTS WALL */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            margin: 0,
            color: INK,
          }}
        >
          {t.leaderboard.achTitle}
        </h2>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: '#8a8f9c',
          }}
        >
          {`${earnedCount} ${t.leaderboard.earnedN}`}
        </span>
      </div>
      <p style={{ fontSize: 13.5, color: MUTED, marginTop: 6, marginBottom: 14 }}>
        {t.leaderboard.achSub}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))',
          gap: 12,
        }}
      >
        {ACHIEVEMENTS.map((a) => (
          <div
            key={a.name}
            style={{
              background: SURFACE,
              border: `1px solid ${a.earned ? a.color + '44' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 14,
              padding: 16,
              opacity: a.earned ? 1 : 0.5,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: a.earned ? a.color + '22' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <Icon name={a.icon} color={a.earned ? a.color : MUTED2} size={24} fill={a.earned} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginTop: 10, color: INK }}>
              {a.name}
            </div>
            <div style={{ fontSize: 12, color: '#8a8f9c', lineHeight: 1.45, marginTop: 4 }}>
              {a.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
