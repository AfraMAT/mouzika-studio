/** Turns raw mix metrics into a score plus localised, plain-English findings. */

import type { MixMetrics } from './analyze';
import type { Locale } from '@/lib/i18n';

export interface Finding {
  tone: 'good' | 'fix';
  text: string;
}

export interface MixReport {
  score: number;
  strengths: Finding[];
  fixes: Finding[];
}

type Copy = Record<string, string>;

const COPY: Record<Locale, Copy> = {
  en: {
    lufsGood: 'Loudness sits in the −14 LUFS streaming pocket — this will translate cleanly across platforms.',
    lufsLow: 'At {v} LUFS it’s quieter than the −14 target. You have headroom; a touch more limiting won’t hurt.',
    lufsHigh: 'At {v} LUFS it’s hotter than −14 — platforms will turn it down and you lose transients for nothing.',
    peakGood: 'True peak stays under −1 dBTP — safe from inter-sample clipping.',
    peakHot: 'True peak hits {v} dBTP. Pull a limiter ceiling to −1 dBTP to avoid clipping on lossy codecs.',
    crestGood: 'Healthy dynamics (crest {v} dB) — punchy without being squashed.',
    crestSquashed: 'Crest factor is only {v} dB — the mix is quite squashed. Ease off the master limiter to let it breathe.',
    crestDynamic: 'Very dynamic ({v} dB crest). Great for a mix; add gentle bus compression before mastering if it feels loose.',
    widthGood: 'Stereo image is wide and correlated — full but mono-safe.',
    widthMono: 'The file is mono. Fine for a stem, but widen pads and FX for a finished stereo master.',
    widthNarrow: 'Fairly narrow image. Spread hats, pads and stabs for width — keep kick and bass centred.',
    widthWide: 'Very wide (low correlation). Check mono compatibility — some of this may cancel on club systems.',
    balGood: 'Tonal balance is even across lows, mids and highs.',
    balBassy: 'Low end dominates ({v}%). High-pass non-bass elements around 100 Hz and check the sub on other speakers.',
    balHarsh: 'Highs are forward ({v}%). A gentle high-shelf cut or de-esser will take the edge off.',
    balThin: 'Low end is light ({v}%). Add weight to the kick/bass or lower your high-pass filters.',
    balScooped: 'Mids are scooped — vocals and leads may feel distant. Nudge 1–3 kHz up a little.',
  },
  fr: {
    lufsGood: 'La loudness est dans la zone streaming à −14 LUFS — ça voyagera proprement sur les plateformes.',
    lufsLow: 'À {v} LUFS, c’est plus bas que la cible −14. Vous avez de la marge ; un peu plus de limiteur ne fera pas de mal.',
    lufsHigh: 'À {v} LUFS, c’est plus fort que −14 — les plateformes vont baisser et vous perdez des transitoires pour rien.',
    peakGood: 'La crête vraie reste sous −1 dBTP — pas de clipping inter-échantillons.',
    peakHot: 'La crête vraie atteint {v} dBTP. Mettez le plafond du limiteur à −1 dBTP pour éviter le clipping.',
    crestGood: 'Dynamique saine (crest {v} dB) — punchy sans être écrasé.',
    crestSquashed: 'Le crest n’est que de {v} dB — le mix est assez écrasé. Allégez le limiteur master.',
    crestDynamic: 'Très dynamique ({v} dB de crest). Ajoutez une légère compression de bus avant le mastering si besoin.',
    widthGood: 'Image stéréo large et corrélée — pleine mais compatible mono.',
    widthMono: 'Le fichier est mono. Correct pour un stem, mais élargissez nappes et FX pour un master stéréo.',
    widthNarrow: 'Image assez étroite. Élargissez hats, nappes et stabs — gardez kick et basse au centre.',
    widthWide: 'Très large (faible corrélation). Vérifiez la compatibilité mono — une partie peut s’annuler en club.',
    balGood: 'Équilibre tonal régulier entre graves, médiums et aigus.',
    balBassy: 'Les graves dominent ({v} %). Coupez les éléments non-basse vers 100 Hz et vérifiez le sub ailleurs.',
    balHarsh: 'Les aigus sont en avant ({v} %). Un léger shelf ou un de-esser adoucira ça.',
    balThin: 'Les graves sont légers ({v} %). Renforcez kick/basse ou baissez vos coupe-bas.',
    balScooped: 'Les médiums sont creusés — voix et leads peuvent sembler lointains. Remontez un peu 1–3 kHz.',
  },
  ar: {
    lufsGood: 'الجهارة في منطقة البثّ عند −14 LUFS — ستُترجَم بنظافة عبر المنصات.',
    lufsLow: 'عند {v} LUFS هي أهدأ من هدف −14. لديك متسع؛ قليل من الليمتر لن يضر.',
    lufsHigh: 'عند {v} LUFS أعلى من −14 — المنصات ستخفضها وتخسر العابرات بلا فائدة.',
    peakGood: 'الذروة الحقيقية تبقى تحت −1 dBTP — آمنة من القص.',
    peakHot: 'الذروة الحقيقية تبلغ {v} dBTP. اضبط سقف الليمتر عند −1 dBTP لتجنّب القص.',
    crestGood: 'ديناميكية صحية (crest {v} dB) — قوية دون سحق.',
    crestSquashed: 'الـcrest {v} dB فقط — المزيج مسحوق نوعًا ما. خفّف ليمتر الماستر.',
    crestDynamic: 'ديناميكية عالية جدًا ({v} dB). أضف ضغط باص لطيفًا قبل الماسترينغ إن لزم.',
    widthGood: 'صورة استريو واسعة ومترابطة — ممتلئة وآمنة أحاديًا.',
    widthMono: 'الملف أحادي. جيد كـstem، لكن وسّع الباد والمؤثرات لماستر استريو.',
    widthNarrow: 'صورة ضيقة نسبيًا. وسّع الهاي هات والباد والستابس — أبقِ الكيك والباس في الوسط.',
    widthWide: 'واسع جدًا (ترابط منخفض). تحقّق من التوافق الأحادي — قد يُلغى بعضه في الأندية.',
    balGood: 'التوازن الطيفي منتظم بين المنخفضات والمتوسطات والعاليات.',
    balBassy: 'المنخفضات تهيمن ({v}٪). اقطع العناصر غير الباص عند 100 هرتز وافحص الساب على سماعات أخرى.',
    balHarsh: 'العاليات بارزة ({v}٪). خفض شِلف عالٍ لطيف أو دي-إسر سيهدّئها.',
    balThin: 'المنخفضات خفيفة ({v}٪). أضف ثقلًا للكيك/الباس أو اخفض القطع المنخفض.',
    balScooped: 'المتوسطات مجوّفة — قد تبدو الأصوات بعيدة. ارفع 1–3 كيلوهرتز قليلًا.',
  },
};

function fmt(tpl: string, v: string): string {
  return tpl.replace('{v}', v);
}

export function buildReport(m: MixMetrics, locale: Locale): MixReport {
  const c = COPY[locale] ?? COPY.en;
  const strengths: Finding[] = [];
  const fixes: Finding[] = [];
  let score = 100;

  // loudness
  if (m.lufs >= -15 && m.lufs <= -13) strengths.push({ tone: 'good', text: c.lufsGood });
  else if (m.lufs < -15) {
    fixes.push({ tone: 'fix', text: fmt(c.lufsLow, m.lufs.toFixed(1)) });
    score -= Math.min(18, Math.abs(m.lufs + 14) * 2);
  } else {
    fixes.push({ tone: 'fix', text: fmt(c.lufsHigh, m.lufs.toFixed(1)) });
    score -= Math.min(22, (m.lufs + 14) * 3);
  }

  // true peak
  if (m.peakDb <= -1) strengths.push({ tone: 'good', text: c.peakGood });
  else {
    fixes.push({ tone: 'fix', text: fmt(c.peakHot, m.peakDb.toFixed(1)) });
    score -= Math.min(16, (m.peakDb + 1) * 6 + 4);
  }

  // dynamics
  if (m.crest >= 6 && m.crest <= 16) strengths.push({ tone: 'good', text: fmt(c.crestGood, m.crest.toFixed(1)) });
  else if (m.crest < 6) {
    fixes.push({ tone: 'fix', text: fmt(c.crestSquashed, m.crest.toFixed(1)) });
    score -= Math.min(16, (6 - m.crest) * 3);
  } else {
    strengths.push({ tone: 'good', text: fmt(c.crestDynamic, m.crest.toFixed(1)) });
  }

  // stereo
  if (m.mono) fixes.push({ tone: 'fix', text: c.widthMono });
  else if (m.width < 0.15) {
    fixes.push({ tone: 'fix', text: c.widthNarrow });
    score -= 6;
  } else if (m.width > 0.9) {
    fixes.push({ tone: 'fix', text: c.widthWide });
    score -= 8;
  } else strengths.push({ tone: 'good', text: c.widthGood });

  // tonal balance
  const lowPct = Math.round(m.balance.low * 100);
  const highPct = Math.round(m.balance.high * 100);
  if (m.balance.low > 0.6) {
    fixes.push({ tone: 'fix', text: fmt(c.balBassy, String(lowPct)) });
    score -= 10;
  } else if (m.balance.high > 0.4) {
    fixes.push({ tone: 'fix', text: fmt(c.balHarsh, String(highPct)) });
    score -= 8;
  } else if (m.balance.low < 0.18) {
    fixes.push({ tone: 'fix', text: fmt(c.balThin, String(lowPct)) });
    score -= 8;
  } else if (m.balance.mid < 0.28) {
    fixes.push({ tone: 'fix', text: c.balScooped });
    score -= 6;
  } else strengths.push({ tone: 'good', text: c.balGood });

  return { score: Math.max(20, Math.min(100, Math.round(score))), strengths, fixes };
}
