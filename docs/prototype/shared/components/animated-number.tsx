'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly tweens between numeric values over ~600ms (20 steps × 30ms).
 * Useful for live-updating counters where a hard cut feels jarring.
 *
 * Usage:
 *   <AnimatedNumber value={actualWeight} />
 *
 * The component formats with `toLocaleString()` so 12345 → "12,345".
 */
export default function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    const diff  = value - prevRef.current;
    const steps = 20;
    const start = prevRef.current;
    let step    = 0;

    const id = setInterval(() => {
      step++;
      setDisplay(Math.round(start + (diff * step) / steps));
      if (step >= steps) {
        clearInterval(id);
        prevRef.current = value;
      }
    }, 30);
    return () => clearInterval(id);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}
