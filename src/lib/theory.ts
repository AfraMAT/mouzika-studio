/**
 * Music-theory primitives for Mouzika's interactive widgets.
 * Pure functions only — covered by unit tests.
 */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type ScaleType = 'major' | 'minor';

/** Semitone offsets of each scale degree within one octave. */
export const SCALE_STEPS: Record<ScaleType, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10], // natural minor
};

/** Roman-numeral labels for the seven diatonic triads. */
export const ROMAN: Record<ScaleType, string[]> = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
};

/** Canonical loop each scale plays for the "play progression" button. */
export const PROGRESSION: Record<ScaleType, number[]> = {
  major: [0, 4, 5, 3], // I–V–vi–IV
  minor: [0, 5, 2, 6], // i–VI–III–VII
};

/** Interval names indexed to the ear-training semitone set. */
export const EAR_SEMITONES = [3, 4, 5, 6, 7, 10, 12] as const;

/** Convert a MIDI number to scientific pitch notation (middle C = C4 = 60). */
export function midiToNote(midi: number): string {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

/** Strip the octave digit(s) from a note name: "C#4" -> "C#". */
export function pitchClass(note: string): string {
  return note.replace(/-?\d+/g, '');
}

/**
 * MIDI notes of the diatonic triad built on `degree` (0-indexed) of the
 * chosen key. Root C3 = MIDI 48, matching the prototype's synth range.
 */
export function chordNotesFor(degree: number, rootIndex: number, scale: ScaleType): number[] {
  const steps = SCALE_STEPS[scale];
  const rootMidi = 48 + rootIndex;
  return [0, 2, 4].map((k) => {
    const sd = degree + k;
    return rootMidi + steps[sd % 7] + Math.floor(sd / 7) * 12;
  });
}

/** Note names (with octave) of a diatonic triad. */
export function chordNoteNames(degree: number, rootIndex: number, scale: ScaleType): string[] {
  return chordNotesFor(degree, rootIndex, scale).map(midiToNote);
}

/** Format a frequency for the EQ challenge: 8000 -> "8 kHz", 250 -> "250 Hz". */
export function formatFreq(hz: number): string {
  return hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`;
}

/** Human key name, e.g. "C Minor". */
export function keyName(rootIndex: number, scale: ScaleType, majorLabel: string, minorLabel: string): string {
  return `${NOTE_NAMES[rootIndex]} ${scale === 'major' ? majorLabel : minorLabel}`;
}

/** The white/black keyboard layout used by the synth playground. */
export function buildKeyboard(octaves: number[] = [3, 4]) {
  const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackMap: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
  const whites: string[] = [];
  octaves.forEach((oct) => whiteNotes.forEach((n) => whites.push(n + oct)));
  whites.push(`C${octaves[octaves.length - 1] + 1}`);

  const total = whites.length;
  const wPct = 100 / total;

  const blacks: { note: string; leftPct: number; widthPct: number }[] = [];
  whites.forEach((wn, idx) => {
    const letter = wn.replace(/\d+/g, '');
    const oct = wn.replace(/\D+/g, '');
    if (blackMap[letter] && idx < total - 1) {
      blacks.push({
        note: blackMap[letter] + oct,
        leftPct: (idx + 1) * wPct - wPct * 0.3,
        widthPct: wPct * 0.6,
      });
    }
  });

  return { whites, blacks, whitePct: wPct };
}
