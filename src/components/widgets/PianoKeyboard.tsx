'use client';

import { useCallback, useEffect, useState } from 'react';
import { getEngine } from '@/lib/audio/engine';
import { buildKeyboard } from '@/lib/theory';

/**
 * Playable piano keyboard. Supports click, drag-across (glissando) and touch.
 * Held notes are tracked so drag doesn't re-trigger the same note.
 */
export function PianoKeyboard({ octaves = [3, 4], height = 150 }: { octaves?: number[]; height?: number }) {
  const engine = getEngine();
  const { whites, blacks, whitePct } = buildKeyboard(octaves);
  const [held, setHeld] = useState<Set<string>>(new Set());
  const [pointerDown, setPointerDown] = useState(false);

  const on = useCallback(
    (note: string) => {
      engine.noteOn(note);
      setHeld((s) => new Set(s).add(note));
    },
    [engine]
  );
  const off = useCallback(
    (note: string) => {
      engine.noteOff(note);
      setHeld((s) => {
        const n = new Set(s);
        n.delete(note);
        return n;
      });
    },
    [engine]
  );

  useEffect(() => {
    const up = () => {
      setPointerDown(false);
      setHeld((s) => {
        s.forEach((n) => engine.noteOff(n));
        return new Set();
      });
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [engine]);

  return (
    <div style={{ position: 'relative', height, borderRadius: 12, overflow: 'hidden', touchAction: 'none', userSelect: 'none' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        {whites.map((note) => (
          <button
            key={note}
            aria-label={note}
            onPointerDown={(e) => {
              e.preventDefault();
              setPointerDown(true);
              on(note);
            }}
            onPointerEnter={() => {
              if (pointerDown) on(note);
            }}
            onPointerLeave={() => {
              if (pointerDown) off(note);
            }}
            onPointerUp={() => off(note)}
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              borderRight: '1px solid #0a0b10',
              borderRadius: '0 0 8px 8px',
              background: held.has(note) ? '#CBF24E' : 'linear-gradient(#f4f5f8,#dfe2ea)',
              cursor: 'pointer',
              transition: 'background .04s',
            }}
          />
        ))}
      </div>
      {blacks.map((b) => (
        <button
          key={b.note}
          aria-label={b.note}
          onPointerDown={(e) => {
            e.preventDefault();
            setPointerDown(true);
            on(b.note);
          }}
          onPointerEnter={() => {
            if (pointerDown) on(b.note);
          }}
          onPointerLeave={() => {
            if (pointerDown) off(b.note);
          }}
          onPointerUp={() => off(b.note)}
          style={{
            position: 'absolute',
            top: 0,
            height: '62%',
            width: `${b.widthPct}%`,
            left: `${b.leftPct}%`,
            background: held.has(b.note) ? '#a6cc2e' : 'linear-gradient(#23262f,#111318)',
            border: '1px solid #000',
            borderRadius: '0 0 6px 6px',
            cursor: 'pointer',
            zIndex: 2,
            transition: 'background .04s',
            boxShadow: '0 4px 7px rgba(0,0,0,0.55)',
          }}
        />
      ))}
    </div>
  );
}
