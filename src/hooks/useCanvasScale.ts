import { useEffect, useState } from "react";
import { CANVAS_WIDTH, MIN_DESKTOP_WIDTH, MAX_DESKTOP_WIDTH } from "../domain/constants";

/**
 * Scales the fixed-desktop canvas to fill the viewport width, but never
 * shrinks past the reference small-desktop width — below that floor the
 * page just scrolls instead of shrinking further.
 */
export function useCanvasScale(): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const computeScale = () => {
      const effectiveWidth = Math.min(Math.max(window.innerWidth, MIN_DESKTOP_WIDTH), MAX_DESKTOP_WIDTH);
      setScale(effectiveWidth / CANVAS_WIDTH);
    };

    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  return scale;
}
