/**
 * Rule-based tutor reply selection — used as the client-side fallback when the
 * AI endpoint is unavailable, and by the API route as a graceful default when
 * no ANTHROPIC_API_KEY is configured.
 */

export interface CannedReplies {
  sidechain: string;
  mask: string;
  reverb: string;
  eight08: string;
  master: string;
  chords: string;
  arrange: string;
  ai: string;
  def: string;
}

export function cannedReply(text: string, c: CannedReplies): string {
  const q = text.toLowerCase();
  if (/sidechain|pump|duck/.test(q)) return c.sidechain;
  if (/kick.*bass|bass.*kick|clash|mask|muddy|mud/.test(q)) return c.mask;
  if (/reverb|space|wash/.test(q)) return c.reverb;
  if (/808|sub|low end/.test(q)) return c.eight08;
  if (/master|loud|lufs|limit/.test(q)) return c.master;
  if (/chord|progress|key|scale|melody/.test(q)) return c.chords;
  if (/arrange|structure|drop|build|intro/.test(q)) return c.arrange;
  if (/suno|udio|ai|stem/.test(q)) return c.ai;
  return c.def;
}

export const LOCALE_NAME: Record<string, string> = { en: 'English', fr: 'French', ar: 'Arabic' };
