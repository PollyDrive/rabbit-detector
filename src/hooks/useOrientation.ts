import { useViewportSize } from "./useViewportSize";

export type Orientation = "portrait" | "landscape";

export function useOrientation(): Orientation {
  const { width, height } = useViewportSize();
  return width >= height ? "landscape" : "portrait";
}
