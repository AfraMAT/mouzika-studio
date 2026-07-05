'use client';

import { useI18n, LOCALES, LOCALE_LABELS } from '@/lib/i18n';
import { Icon } from './Icon';

export function LanguageSwitch({ withIcon = false, compact = false }: { withIcon?: boolean; compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const pad = compact ? '6px 7px' : '7px 10px';
  const minW = compact ? 27 : 32;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        padding: withIcon ? 3 : 0,
        background: withIcon ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: withIcon ? '1px solid rgba(255,255,255,0.08)' : 'none',
        borderRadius: 11,
      }}
    >
      {withIcon && <Icon name="language" size={17} color="#8a8f9c" style={{ padding: '0 4px' }} />}
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={`Switch language to ${code.toUpperCase()}`}
            style={{
              minWidth: minW,
              padding: pad,
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: compact ? 11 : 11.5,
              fontWeight: 700,
              transition: 'all .14s',
              background: active ? '#CBF24E' : 'transparent',
              color: active ? '#0A0B10' : '#8a8f9c',
            }}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
