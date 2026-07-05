'use client';

import { useState } from 'react';
import { PROFILE_TRACKS, PROFILE_ACTIVITY, ART_GRADS } from '@/lib/content/community';
import { ACHIEVEMENTS } from '@/lib/content/curriculum';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { Icon } from '@/components/ui/Icon';
import { AccountPanel } from '@/components/app/AccountPanel';

const ART_FALLBACK = 'linear-gradient(135deg,#222,#151726)';
const GENRE_CHIPS = ['House', 'Melodic Techno', 'Deep House'];

export default function ProfilePage() {
  const { t } = useI18n();
  const { state, hydrated } = useProgress();
  const [activeTab, setActiveTab] = useState(0);

  const p = t.profile;

  const stats = [
    { val: '8', label: p.tracksN, color: '#CBF24E' },
    { val: '214', label: p.followers, color: '#4FE3E0' },
    { val: '63', label: p.following, color: '#8B7CFF' },
    { val: hydrated ? String(state.streak) : '·', label: p.streak, color: '#FF9A3C' },
    { val: hydrated ? state.xp.toLocaleString() : '·', label: p.xp, color: '#FF5C93' },
  ];

  const secondaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#c8ccd6',
    padding: '10px 16px',
    borderRadius: 11,
    fontFamily: 'var(--font-sans)',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 60px' }}>
      <AccountPanel />

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 30,
            color: '#0A0B10',
          }}
        >
          {state.name.charAt(0)}
        </div>

        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 700,
              color: '#F4F5F7',
              lineHeight: 1.2,
            }}
          >
            {`${state.name} Rivera`}
          </h1>
          <div style={{ fontSize: 13, color: '#8a8f9c', marginTop: 5 }}>
            {p.rankLabel}
            <span style={{ margin: '0 8px', opacity: 0.5 }}>•</span>
            {p.joined}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
            {GENRE_CHIPS.map((g) => (
              <span
                key={g}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#c8ccd6',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '5px 11px',
                  borderRadius: 100,
                }}
              >
                {g}
              </span>
            ))}
          </div>

          <p
            style={{
              margin: '14px 0 0',
              fontSize: 14,
              color: '#9aa0ad',
              lineHeight: 1.6,
              maxWidth: 560,
            }}
          >
            {p.bio}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            <button type="button" style={secondaryBtn}>
              <Icon name="edit" size={18} />
              {p.edit}
            </button>
            <button type="button" style={secondaryBtn}>
              <Icon name="ios_share" size={18} />
              {p.share}
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))',
          gap: 12,
          marginTop: 24,
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: '#111219',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '14px 12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                color: s.color,
              }}
            >
              {s.val}
            </div>
            <div style={{ fontSize: 11.5, color: '#8a8f9c', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginTop: 28,
        }}
      >
        {p.tabs.map((tab, i) => {
          const active = activeTab === i;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(i)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 14,
                padding: '12px 4px',
                marginInlineEnd: 18,
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${active ? '#CBF24E' : 'transparent'}`,
                color: active ? '#F4F5F7' : '#8a8f9c',
                cursor: 'pointer',
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div style={{ marginTop: 22 }}>
        {activeTab === 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
              gap: 14,
            }}
          >
            {PROFILE_TRACKS.map((track) => (
              <div
                key={track.title}
                style={{
                  background: '#111219',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: 120,
                    position: 'relative',
                    background: `${
                      ART_GRADS[track.c] || ART_FALLBACK
                    },repeating-linear-gradient(135deg,${track.c}18,${track.c}18 7px,transparent 7px,transparent 15px)`,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      insetInlineStart: 8,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      fontWeight: 700,
                      color: track.c,
                      background: 'rgba(10,11,16,0.6)',
                      border: `1px solid ${track.c}44`,
                      borderRadius: 7,
                      padding: '4px 8px',
                    }}
                  >
                    {track.genre}
                  </span>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#F4F5F7' }}>
                    {track.title}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 10,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b6f7d' }}>
                      {`${track.plays} plays`}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        color: '#9aa0ad',
                      }}
                    >
                      <Icon name="favorite" size={14} color="#FF5C93" />
                      {track.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))',
              gap: 14,
            }}
          >
            {ACHIEVEMENTS.map((a) => (
              <div
                key={a.name}
                style={{
                  background: '#111219',
                  border: `1px solid ${a.earned ? a.color + '44' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 16,
                  padding: 18,
                  opacity: a.earned ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: a.earned ? a.color + '22' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={a.icon} size={26} color={a.earned ? a.color : '#6b6f7d'} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#F4F5F7', marginTop: 12 }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 13, color: '#9aa0ad', lineHeight: 1.5, marginTop: 4 }}>
                  {a.desc}
                </div>
                <div style={{ marginTop: 12 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      padding: '4px 9px',
                      borderRadius: 6,
                      background: a.earned ? a.color : 'rgba(255,255,255,0.06)',
                      color: a.earned ? '#0A0B10' : '#6b6f7d',
                    }}
                  >
                    {a.earned ? p.earned : p.locked}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 2 && (
          <div>
            {PROFILE_ACTIVITY.map((item, i) => {
              const last = i === PROFILE_ACTIVITY.length - 1;
              return (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: `${item.color}22`,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={item.icon} size={17} color={item.color} />
                    </div>
                    {!last && (
                      <div
                        style={{
                          width: 2,
                          flex: 1,
                          minHeight: 18,
                          background: 'rgba(255,255,255,0.08)',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ paddingBottom: last ? 0 : 20 }}>
                    <div style={{ fontSize: 14, color: '#c8ccd6', lineHeight: 1.5 }}>{item.text}</div>
                    <div style={{ fontSize: 12, color: '#6b6f7d', marginTop: 3 }}>{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
