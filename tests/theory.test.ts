import { describe, it, expect } from 'vitest';
import { midiToNote, pitchClass, chordNotesFor, chordNoteNames, formatFreq, keyName, buildKeyboard, ROMAN, SCALE_STEPS } from '@/lib/theory';

describe('midiToNote', () => {
  it('maps middle C', () => {
    expect(midiToNote(60)).toBe('C4');
  });
  it('maps sharps and octaves', () => {
    expect(midiToNote(61)).toBe('C#4');
    expect(midiToNote(48)).toBe('C3');
    expect(midiToNote(72)).toBe('C5');
  });
});

describe('pitchClass', () => {
  it('strips octave digits', () => {
    expect(pitchClass('C#4')).toBe('C#');
    expect(pitchClass('A2')).toBe('A');
  });
});

describe('chordNotesFor', () => {
  it('builds a C minor triad on degree 0 (root C = index 0)', () => {
    // root MIDI 48 (C3); minor steps [0,3,7] -> C3 Eb3 G3
    expect(chordNotesFor(0, 0, 'minor')).toEqual([48, 51, 55]);
    expect(chordNoteNames(0, 0, 'minor').map(pitchClass)).toEqual(['C', 'D#', 'G']);
  });
  it('builds a C major triad', () => {
    // major steps degree 0 -> C E G
    expect(chordNoteNames(0, 0, 'major').map(pitchClass)).toEqual(['C', 'E', 'G']);
  });
  it('wraps to the next octave for high degrees', () => {
    const notes = chordNotesFor(6, 0, 'major'); // vii° -> B D F (with octave wrap on the 5th)
    expect(notes[0]).toBe(48 + SCALE_STEPS.major[6]); // B3
    expect(notes[2]).toBeGreaterThan(notes[0]);
  });
});

describe('formatFreq', () => {
  it('formats Hz and kHz', () => {
    expect(formatFreq(250)).toBe('250 Hz');
    expect(formatFreq(8000)).toBe('8 kHz');
    expect(formatFreq(1000)).toBe('1 kHz');
  });
});

describe('keyName', () => {
  it('composes a readable key name', () => {
    expect(keyName(0, 'minor', 'Major', 'Minor')).toBe('C Minor');
    expect(keyName(7, 'major', 'Major', 'Minor')).toBe('G Major');
  });
});

describe('ROMAN numerals', () => {
  it('has seven diatonic degrees per scale', () => {
    expect(ROMAN.major).toHaveLength(7);
    expect(ROMAN.minor[0]).toBe('i');
    expect(ROMAN.major[0]).toBe('I');
  });
});

describe('buildKeyboard', () => {
  it('produces 15 white keys across two octaves + top C', () => {
    const kb = buildKeyboard([3, 4]);
    expect(kb.whites).toHaveLength(15);
    expect(kb.whites[0]).toBe('C3');
    expect(kb.whites[kb.whites.length - 1]).toBe('C5');
  });
  it('positions black keys with sensible bounds', () => {
    const kb = buildKeyboard([3, 4]);
    expect(kb.blacks.length).toBeGreaterThan(8);
    for (const b of kb.blacks) {
      expect(b.leftPct).toBeGreaterThan(0);
      expect(b.leftPct).toBeLessThan(100);
    }
  });
});
