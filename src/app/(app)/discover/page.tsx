'use client';

import { useState } from 'react';
import { DISCOVER_TRACKS, ART_GRADS } from '@/lib/content/community';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { Icon } from '@/components/ui/Icon';
import { HoverCard } from '@/components/ui/primitives';

const FALLBACK_GRAD = 'linear-gradient(135deg,#222,#151726)';

function stripeOverlay(c: string): string {
  return `repeating-linear-gradient(135deg,${c}18,${c}18 7px,transparent 7px,transparent 15px)`;
}

export default function DiscoverPage() {
  const { t } = useI18n();
  const { state, toggleLike, hydrated } = useProgress();
  const [activeTab, setActiveTab] = useState(0);

  const featured = DISCOVER_TRACKS[0];
  const feed = DISCOVER_TRACKS.slice(1);

  const isLiked = (id: string): boolean => hydrated && state.likedTracks.includes(id);

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* header */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 30,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#F4F5F7',
          margin: '0 0 8px',
        }}
      >
        {t.discover.title}
      </h1>
      <p style={{ fontSize: 15, color: '#9aa0ad', lineHeight: 1.6, maxWidth: 640, margin: '0 0 22px' }}>
        {t.discover.sub}
      </p>

      {/* tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        {t.discover.tabs.map((label, i) => {
          const active = activeTab === i;
          return (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 13,
                padding: '9px 16px',
                borderRadius: 100,
                border: 'none',
                cursor: 'pointer',
                background: active ? '#CBF24E' : 'rgba(255,255,255,0.05)',
                color: active ? '#0A0B10' : '#9aa0ad',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* featured */}
      <div
        style={{
          background: '#111219',
          border: '1px solid rgba(203,242,78,0.2)',
          borderRadius: 22,
          padding: 16,
          display: 'flex',
          gap: 20,
          overflow: 'hidden',
          marginBottom: 22,
          flexWrap: 'wrap',
        }}
      >
        {/* artwork */}
        <div
          style={{
            position: 'relative',
            flex: '0 0 200px',
            height: 150,
            borderRadius: 14,
            overflow: 'hidden',
            background: ART_GRADS[featured.c] ?? FALLBACK_GRAD,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: stripeOverlay(featured.c),
            }}
          />
          <Icon name="play_circle" size={48} fill color={featured.c} style={{ position: 'relative', zIndex: 1 }} />
        </div>

        {/* meta */}
        <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: featured.c,
              marginBottom: 8,
            }}
          >
            {t.discover.featured}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: '#F4F5F7',
              marginBottom: 4,
            }}
          >
            {featured.title}
          </div>
          <div style={{ fontSize: 13, color: '#9aa0ad', marginBottom: 12 }}>
            {t.discover.by} {featured.artist}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                color: featured.c,
                background: 'rgba(10,11,16,0.6)',
                border: `1px solid ${featured.c}44`,
                borderRadius: 7,
                padding: '4px 8px',
              }}
            >
              {featured.genre}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b6f7d' }}>
              <Icon name="headphones" size={14} color="#6b6f7d" />
              {featured.plays} {t.discover.plays}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b6f7d' }}>
              <Icon name="favorite" size={14} fill color="#FF5C93" />
              {featured.likes.toLocaleString()}
            </span>
          </div>

          <div style={{ marginTop: 'auto' }}>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                fontSize: 12,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#c8ccd6',
                cursor: 'pointer',
              }}
            >
              {t.discover.follow}
            </button>
          </div>
        </div>
      </div>

      {/* feed grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {feed.map((track) => {
          const liked = isLiked(track.id);
          const grad = ART_GRADS[track.c] ?? FALLBACK_GRAD;
          return (
            <HoverCard
              key={track.id}
              hoverBorder={`${track.c}44`}
              style={{
                background: '#111219',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {/* artwork */}
              <div
                style={{
                  position: 'relative',
                  height: 130,
                  background: grad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, backgroundImage: stripeOverlay(track.c) }} />
                {/* genre chip */}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    fontWeight: 700,
                    color: track.c,
                    background: 'rgba(10,11,16,0.6)',
                    border: `1px solid ${track.c}44`,
                    borderRadius: 7,
                    padding: '4px 8px',
                    zIndex: 1,
                  }}
                >
                  {track.genre}
                </span>
                {/* avatar */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: track.c,
                    color: '#0A0B10',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {track.initial}
                </div>
              </div>

              {/* body */}
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#F4F5F7', marginBottom: 2 }}>{track.title}</div>
                <div style={{ fontSize: 13, color: '#9aa0ad', marginBottom: 12 }}>
                  {t.discover.by} {track.artist}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#6b6f7d' }}>
                    {track.plays} {t.discover.plays}
                  </span>
                  <button
                    onClick={() => toggleLike(track.id)}
                    aria-pressed={liked}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    <Icon name="favorite" size={16} fill={liked} color={liked ? '#FF5C93' : '#6b6f7d'} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: liked ? '#FF5C93' : '#6b6f7d' }}>
                      {liked ? track.likes + 1 : track.likes}
                    </span>
                  </button>
                </div>
              </div>
            </HoverCard>
          );
        })}
      </div>
    </div>
  );
}
