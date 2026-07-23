import { useEffect, useState } from "react";

interface ViewportSize {
  width: number;
  height: number;
}

function readViewportSize(): ViewportSize {
  if (typeof window === "undefined") {
    return { width: 1024, height: 768 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

// ResizeObserver on the root element, not a window "resize" listener — the
// resize event doesn't reliably fire in every environment (seen stuck on
// the first-ever size in automated/remote-controlled browser contexts),
// while ResizeObserver consistently does.
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(readViewportSize);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => {
      setSize(readViewportSize());
    });
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return size;
}
