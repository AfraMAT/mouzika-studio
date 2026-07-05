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

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export function AccountPanel() {
  const { configured, ready, user, signIn, signUp, signInWithGoogle, signOut } = useAuth();
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

  const onGoogle = async () => {
    setError(null);
    setInfo(null);
    const { error: err } = await signInWithGoogle();
    // On success the browser redirects to Google; only surface a config error.
    if (err) setError(err);
  };

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

      <button
        type="button"
        onClick={onGoogle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          marginTop: 14,
          background: '#fff',
          border: 'none',
          borderRadius: 11,
          color: '#1f2328',
          padding: '11px 14px',
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        <GoogleG />
        {a.continueGoogle}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 0' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <span style={{ fontSize: 12, color: '#6b6f7d' }}>{a.or}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
