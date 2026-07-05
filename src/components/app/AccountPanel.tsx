'use client';

/**
 * Account / cloud-sync panel shown at the top of the profile page. Renders
 * nothing unless Supabase is configured, so the app is visually unchanged in the
 * offline (localStorage-only) build. Signed out it offers email/password sign-in
 * and sign-up; signed in it shows the account and a sign-out control. Progress
 * sync itself is handled by the store (src/lib/store/cloud.ts).
 */

import { useState, type CSSProperties } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useI18n } from '@/lib/i18n';
import { Icon } from '@/components/ui/Icon';

const card: CSSProperties = {
  background: '#111219',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: 18,
  marginBottom: 24,
};

const input: CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 11,
  color: '#F4F5F7',
  padding: '11px 13px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  boxSizing: 'border-box',
};

const primaryBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: '#CBF24E',
  border: 'none',
  color: '#0A0B10',
  padding: '11px 18px',
  borderRadius: 11,
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const ghostBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#8a8f9c',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
};

export function AccountPanel() {
  const { configured, ready, user, signIn, signUp, signOut } = useAuth();
  const { t } = useI18n();
  const a = t.auth;

  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Inert / offline build → render nothing, keeping the page identical.
  if (!configured) return null;
  if (!ready) return null;

  if (user) {
    return (
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'rgba(203,242,78,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="cloud_done" size={22} color="#CBF24E" />
          </div>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#8a8f9c' }}>{a.signedInAs}</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#F4F5F7',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </div>
            <div style={{ fontSize: 12.5, color: '#6b6f7d', marginTop: 3 }}>{a.subtitleIn}</div>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            style={{
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
            }}
          >
            <Icon name="logout" size={18} />
            {a.signOut}
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'up') {
        const { error: err, needsConfirmation } = await signUp(email, password);
        if (err) setError(err);
        else if (needsConfirmation) setInfo(a.checkEmail);
        // else: session issued immediately → onAuthStateChange flips the panel.
      } else {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
      }
    } catch {
      setError(a.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={card}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: '#F4F5F7' }}>
        {a.title}
      </div>
      <div style={{ fontSize: 13, color: '#8a8f9c', marginTop: 4, lineHeight: 1.5 }}>{a.subtitleOut}</div>

      <form onSubmit={onSubmit} style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder={a.email}
          aria-label={a.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
          placeholder={a.password}
          aria-label={a.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        {error && (
          <div role="alert" style={{ fontSize: 12.5, color: '#FF5C93' }}>
            {error}
          </div>
        )}
        {info && (
          <div role="status" style={{ fontSize: 12.5, color: '#CBF24E', lineHeight: 1.5 }}>
            {info}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 2 }}>
          <button type="submit" disabled={busy} style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}>
            {busy ? a.working : mode === 'up' ? a.signUp : a.signIn}
          </button>
          <button
            type="button"
            style={ghostBtn}
            onClick={() => {
              setMode((m) => (m === 'in' ? 'up' : 'in'));
              setError(null);
              setInfo(null);
            }}
          >
            {mode === 'in' ? a.toSignUp : a.toSignIn}
          </button>
        </div>
      </form>
    </div>
  );
}
