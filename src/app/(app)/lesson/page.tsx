'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useProgress } from '@/lib/store/progress';
import { Icon } from '@/components/ui/Icon';
import { DrumSequencer } from '@/components/widgets/DrumSequencer';

export default function LessonPage() {
  const { t, isRTL } = useI18n();
  const router = useRouter();
  const { completeLesson } = useProgress();
  const [edited, setEdited] = useState(false);

  const finish = () => {
    completeLesson('beats-1', 50);
    router.push('/learn');
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 120px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: '#8B7CFF', marginBottom: 10 }}>{t.lesson.unit}</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 7vw, 34px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 14px' }}>{t.lesson.title}</h1>
      <p style={{ fontSize: 16, color: '#c8ccd6', lineHeight: 1.65, margin: '0 0 26px' }}>
        {t.lesson.intro1}
        <b style={{ color: '#F4F5F7' }}>{t.lesson.introBold}</b>
        {t.lesson.intro2}
      </p>

      <DrumSequencer onEdited={() => setEdited(true)} />

      {/* tutor tip */}
      <div style={{ display: 'flex', gap: 14, marginTop: 24, padding: '18px 20px', borderRadius: 16, background: 'rgba(139,124,255,0.07)', border: '1px solid rgba(139,124,255,0.2)' }}>
        <div style={{ flexShrink: 0, width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="auto_awesome" size={19} fill color="#0A0B10" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#c4b9ff' }}>{t.lesson.tipTitle}</div>
          <p style={{ fontSize: 14, color: '#c8ccd6', lineHeight: 1.6, margin: 0 }}>
            {t.lesson.tip1}
            <i style={{ color: '#F4F5F7' }}>{t.lesson.tipEm}</i>
            {t.lesson.tip2}
          </p>
        </div>
      </div>

      {/* bottom bar */}
      <div
        className="lg:ps-[92px] lesson-actionbar"
        style={{
          position: 'fixed',
          insetInline: 0,
          zIndex: 150,
          paddingBlock: 14,
          background: 'rgba(10,11,16,0.9)',
          backdropFilter: 'blur(14px)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button onClick={finish} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: '#6b6f7d', background: 'none', border: 'none', cursor: 'pointer' }}>
            {t.lesson.skip}
          </button>
          <button
            onClick={finish}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, padding: '13px 26px', borderRadius: 14, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', boxShadow: '0 4px 0 #93B81F', animation: edited ? 'glow 2.2s ease-in-out infinite' : 'none' }}
          >
            {t.lesson.continueBtn} <Icon name={isRTL ? 'arrow_back' : 'arrow_forward'} size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
