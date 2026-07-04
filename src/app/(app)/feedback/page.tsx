'use client';

import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';
import { FeedbackAnalyzer } from '@/components/widgets/FeedbackAnalyzer';

export default function FeedbackPage() {
  const { t } = useI18n();
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(139,124,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="graphic_eq" size={26} color="#8B7CFF" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{t.feedbackui.title}</h1>
        </div>
      </div>
      <p style={{ fontSize: 15, color: '#9aa0ad', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 620 }}>{t.feedbackui.sub}</p>
      <FeedbackAnalyzer />
    </div>
  );
}
