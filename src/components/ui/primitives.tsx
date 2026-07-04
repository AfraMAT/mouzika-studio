'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useHover } from '@/lib/useHover';

/** A card that lifts and changes border colour on hover. */
export function HoverCard({
  children,
  style,
  hoverBorder = 'rgba(255,255,255,0.16)',
  lift = 4,
  as: Tag = 'div',
  onClick,
  className,
  ...rest
}: {
  children: ReactNode;
  style?: CSSProperties;
  hoverBorder?: string;
  lift?: number;
  as?: 'div' | 'button' | 'a';
  onClick?: () => void;
  className?: string;
  href?: string;
}) {
  const { hovered, bind } = useHover();
  const Comp = Tag as 'div';
  return (
    <Comp
      {...bind}
      {...rest}
      onClick={onClick}
      className={className}
      style={{
        transition: 'transform .16s ease, border-color .16s ease',
        transform: hovered ? `translateY(-${lift}px)` : 'none',
        borderColor: hovered ? hoverBorder : undefined,
        ...style,
      }}
    >
      {children}
    </Comp>
  );
}

/** A primary "candy" button with a 3D bottom shadow, as in the design. */
export function CandyButton({
  children,
  onClick,
  color = '#CBF24E',
  shadow = '#93B81F',
  ink = '#0A0B10',
  style,
  disabled,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  shadow?: string;
  ink?: string;
  style?: CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: 15,
        border: 'none',
        borderRadius: 13,
        padding: '13px 22px',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: `0 4px 0 ${shadow}`,
        background: color,
        color: ink,
        transition: 'transform .08s, box-shadow .08s',
        ...style,
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 2px 0 ${shadow}`;
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'none';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 0 ${shadow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'none';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 0 ${shadow}`;
      }}
    >
      {children}
    </button>
  );
}

/** Section eyebrow label in mono caps. */
export function Eyebrow({ children, color = '#CBF24E' }: { children: ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color }}>{children}</span>
  );
}
