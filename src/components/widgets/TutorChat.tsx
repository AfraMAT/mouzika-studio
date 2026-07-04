'use client';

import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { cannedReply } from '@/lib/tutor';
import { Icon } from '@/components/ui/Icon';

interface Msg {
  role: 'tutor' | 'user';
  text: string;
  intro?: boolean;
}

export function TutorChat() {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([{ role: 'tutor', intro: true, text: '' }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setTyping(true);

    let reply: string | null = null;
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, locale }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.reply) reply = data.reply as string;
      }
    } catch {
      /* fall through to canned */
    }

    const finalReply = reply ?? cannedReply(text, t.canned);
    // small delay so the typing indicator reads naturally when replying locally
    const delay = reply ? 0 : 650;
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: 'tutor', text: finalReply }]);
      setTyping(false);
    }, delay);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', maxWidth: 860, margin: '0 auto' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="auto_awesome" size={22} fill color="#0A0B10" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{t.tutorui.name}</div>
            <div style={{ fontSize: 12.5, color: '#8a8f9c' }}>{t.tutorui.sub}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#8B7CFF', background: 'rgba(139,124,255,0.1)', border: '1px solid rgba(139,124,255,0.25)', borderRadius: 100, padding: '7px 13px' }}>
          <Icon name="menu_book" size={15} /> {t.tutorui.context}
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'tutor' && (
              <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="auto_awesome" size={17} fill color="#0A0B10" />
              </div>
            )}
            <div
              style={
                m.role === 'user'
                  ? { maxWidth: '74%', background: '#CBF24E', color: '#0A0B10', padding: '12px 16px', borderRadius: '16px 16px 5px 16px', fontSize: 14.5, lineHeight: 1.5, fontWeight: 500 }
                  : { maxWidth: '80%', background: '#171922', color: '#e4e7ee', padding: '13px 16px', borderRadius: '16px 16px 16px 5px', fontSize: 14.5, lineHeight: 1.58, border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {m.intro ? t.tutorui.greeting : m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#8B7CFF,#4FE3E0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="auto_awesome" size={17} fill color="#0A0B10" />
            </div>
            <div style={{ background: '#171922', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', borderRadius: '16px 16px 16px 5px', display: 'flex', gap: 4 }}>
              {[0, 1, 2].map((d) => (
                <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#8B7CFF', animation: `typing 1.1s ease-in-out ${d * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* chips + input */}
      <div style={{ padding: '10px 20px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, marginBottom: 12, overflowX: 'auto', paddingBottom: 2 }}>
          {t.chips.map(([label, ask]) => (
            <button
              key={label}
              onClick={() => send(ask)}
              style={{ flexShrink: 0, fontSize: 13, fontWeight: 500, color: '#c8ccd6', background: '#171922', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 100, padding: '9px 15px', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t.tutorui.placeholder}
            rows={1}
            style={{ flex: 1, resize: 'none', background: '#171922', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '13px 16px', color: '#F4F5F7', fontSize: 14.5, fontFamily: 'var(--font-sans)', outline: 'none', maxHeight: 120 }}
          />
          <button
            onClick={() => send()}
            aria-label="Send"
            style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, border: 'none', background: '#CBF24E', color: '#0A0B10', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icon name="arrow_upward" size={22} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#5a5e6b', textAlign: 'center', marginTop: 10 }}>{t.tutorui.disclaimer}</p>
      </div>
    </div>
  );
}
