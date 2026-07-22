import { useEffect, useRef, useState } from "react";

interface ElementSize {
  width: number;
  height: number;
}

/**
 * Measures an element's own (pre-transform) layout box — CSS transforms
 * don't affect what ResizeObserver reports, so this stays accurate even
 * when the element is later visually scaled down via `transform: scale()`.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    observer.observe(el);
    setSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => observer.disconnect();
  }, []);

  return [ref, size] as const;
}
