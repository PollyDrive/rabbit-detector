export const CANVAS_WIDTH = 2752;
export const CANVAS_HEIGHT = 1536;

export type ZoneId = 
  | "garden" 
  | "greenhouse" 
  | "barn" 
  | "fence-west" 
  | "fence-sw" 
  | "fence-se" 
  | "fence-east";

export interface Hitbox {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export const ZONES: Record<ZoneId, Hitbox> = {
  "garden": { x1: 790, x2: 1500, y1: 515, y2: 780 },
  "greenhouse": { x1: 850, x2: 1400, y1: 115, y2: 455 },
  "barn": { x1: 1690, x2: 2120, y1: 110, y2: 500 },
  "fence-west": { x1: 690, x2: 780, y1: 420, y2: 560 },
  "fence-sw": { x1: 1180, x2: 1290, y1: 760, y2: 870 },
  "fence-se": { x1: 2440, x2: 2550, y1: 780, y2: 890 },
  "fence-east": { x1: 2610, x2: 2720, y1: 430, y2: 560 },
};
