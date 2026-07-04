/** The animated four-bar equaliser mark used in the Mouzika wordmark. */
export function EqBars({ height = 22, barW = 4, gap = 3 }: { height?: number; barW?: number; gap?: number }) {
  const bars = [
    { h: 0.4, dur: 1.1, delay: -0.2 },
    { h: 0.9, dur: 0.85, delay: -0.5 },
    { h: 0.6, dur: 1.3, delay: 0 },
    { h: 1.0, dur: 0.75, delay: -0.35 },
  ];
  return (
    <span style={{ display: 'flex', alignItems: 'flex-end', gap, height }} aria-hidden>
      {bars.map((b, i) => (
        <span
          key={i}
          style={{
            width: barW,
            height: Math.round(height * b.h),
            background: '#CBF24E',
            borderRadius: 2,
            transformOrigin: 'bottom',
            animation: `eq ${b.dur}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

export function Wordmark({ size = 21, mono }: { size?: number; mono?: boolean }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <EqBars height={size} barW={4} />
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size, letterSpacing: '-0.02em' }}>
        mouzika
        <span style={{ color: mono ? '#F4F5F7' : '#CBF24E' }}>.studio</span>
      </span>
    </span>
  );
}
