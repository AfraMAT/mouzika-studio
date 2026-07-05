import { NextResponse } from 'next/server';
import { LOCALE_NAME } from '@/lib/tutor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TutorBody {
  message?: string;
  locale?: string;
}

const MODEL = process.env.MOUZIKA_TUTOR_MODEL || 'claude-haiku-4-5-20251001';

// --- Best-effort per-IP rate limiting -------------------------------------
// Guards the (paid) Anthropic path from denial-of-wallet abuse. In-memory, so
// it is per-serverless-instance rather than global — a meaningful speed bump,
// not a hard guarantee; for strict global limits back this with Vercel KV /
// Upstash. A human tutor chat sends a few messages a minute, well under the cap.
const RL_WINDOW_MS = 60_000;
const RL_MAX = 20;
const rlHits = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rlHits.get(ip);
  if (!entry || now > entry.resetAt) {
    rlHits.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS });
    if (rlHits.size > 5000) {
      for (const [k, v] of rlHits) if (now > v.resetAt) rlHits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RL_MAX;
}

const SYSTEM = (langName: string) =>
  `You are Mouzika's friendly, expert electronic-music production tutor. You teach beginners and bedroom producers the modern way: interactive lessons, sound design, mixing, mastering to −14 LUFS, and the AI-tools workflow (Suno/Udio → stems → DAW). Reply in ${langName}. Answer in 2–4 short, practical, encouraging sentences. Be concrete with numbers (Hz, dB, BPM) when relevant. Never invent product prices or legal advice. If asked something off-topic, gently steer back to music production.`;

export async function POST(req: Request) {
  // Throttle abusive volume before doing any work. The client treats a null reply
  // as "use the local canned tutor", so a 429 degrades gracefully for real users.
  if (isRateLimited(clientIp(req))) {
    return NextResponse.json({ reply: null, source: 'fallback' }, { status: 429 });
  }

  let body: TutorBody;
  try {
    body = (await req.json()) as TutorBody;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const message = (body.message ?? '').toString().trim().slice(0, 2000);
  const locale = (body.locale ?? 'en').toString();
  const langName = LOCALE_NAME[locale] ?? 'English';

  if (!message) return NextResponse.json({ error: 'empty message' }, { status: 400 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // No key configured → tell the client to use its local canned tutor.
  if (!apiKey) return NextResponse.json({ reply: null, source: 'fallback' });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: SYSTEM(langName),
        messages: [{ role: 'user', content: message }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      // Upstream error → graceful fallback rather than surfacing an error.
      return NextResponse.json({ reply: null, source: 'fallback' });
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const reply = data.content?.filter((c) => c.type === 'text').map((c) => c.text).join('').trim() || null;
    return NextResponse.json({ reply, source: reply ? 'anthropic' : 'fallback' });
  } catch {
    return NextResponse.json({ reply: null, source: 'fallback' });
  }
}
