"use client";

import * as React from "react";

/**
 * Calls `handler` when a pointer/touch event or Escape key occurs outside the
 * referenced element. Used by lightweight popovers (e.g. the notification bell)
 * to avoid pulling in a full Radix popover dependency.
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  active = true
) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (!active) return;

    const onPointer = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) handler();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [handler, active]);

  return ref;
}
