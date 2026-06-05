"use client";

import * as React from "react";

interface Star {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

/**
 * Deep-space backdrop. Stars are generated on the client (after mount) to avoid
 * SSR hydration mismatches from Math.random, and twinkle extremely slowly so
 * they never distract from the B2B data on top.
 */
export function Starfield({ count = 90 }: { count?: number }) {
  const [stars, setStars] = React.useState<Star[]>([]);

  React.useEffect(() => {
    const generated: Star[] = Array.from({ length: count }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() < 0.85 ? 1 : 2,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 8}s`,
      opacity: 0.2 + Math.random() * 0.5,
    }));
    setStars(generated);
  }, [count]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-space-radial"
    >
      {/* Subtle nebula glows */}
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-aurora/5 blur-3xl" />
      <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-nebula/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-lightning/[0.04] blur-3xl" />
      {/* Stars */}
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
}
