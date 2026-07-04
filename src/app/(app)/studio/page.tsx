'use client';

import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { SynthPlayground } from '@/components/widgets/SynthPlayground';

export default function StudioPage() {
  const { t } = useI18n();
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(203,242,78,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="piano" size={26} color="#CBF24E" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{t.synth.title}</h1>
          <p style={{ fontSize: 14, color: '#8a8f9c', margin: '2px 0 0' }}>{t.synth.sub}</p>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <SynthPlayground />
      </div>
    </div>
  );
}
