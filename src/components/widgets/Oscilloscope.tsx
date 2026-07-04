'use client';

import { useEffect, useRef } from 'react';
import { getEngine } from '@/lib/audio/engine';

/** Live waveform oscilloscope fed by the shared synth's analyser. */
export function Oscilloscope({ height = 120 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const engine = getEngine();
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth * dpr;
      const h = c.clientHeight * dpr;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      const data = engine.getWaveform();
      ctx.lineWidth = 2.5 * dpr;
      ctx.strokeStyle = '#CBF24E';
      ctx.shadowColor = '#CBF24E';
      ctx.shadowBlur = 8 * dpr;
      ctx.beginPath();
      if (data && data.length) {
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * w;
          const y = h / 2 + data[i] * h * 0.42;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
      } else {
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    };
    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height, display: 'block' }} />;
}
