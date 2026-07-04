import type { CSSProperties } from 'react';

interface IconProps {
  name: string;
  size?: number;
  fill?: boolean;
  weight?: number;
  className?: string;
  style?: CSSProperties;
  color?: string;
}

/** A Material Symbols (Rounded) glyph. */
export function Icon({ name, size = 24, fill = false, weight = 400, className = '', style, color }: IconProps) {
  return (
    <span
      aria-hidden
      className={`material-symbols-rounded${fill ? ' fill' : ''} ${className}`}
      style={{
        fontSize: size,
        color,
        fontVariationSettings: `'opsz' ${Math.min(48, Math.max(20, size))}, 'wght' ${weight}, 'FILL' ${fill ? 1 : 0}, 'GRAD' 0`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
