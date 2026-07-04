'use client';

import { useState } from 'react';

/** Tracks hover state for cards that lift / change border on hover. */
export function useHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    bind: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
  };
}
