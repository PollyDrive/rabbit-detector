export const LOCATIONS = [
  'Огород',
  'Теплица',
  'Сарай',
  'Забор — Запад',
  'Забор — Юго-Запад',
  'Забор — Восток',
  'Забор — Юго-Восток',
] as const;

export type Location = typeof LOCATIONS[number];

export interface ZoneConfig {
  location: Location;
  hitbox: {
    x: [number, number];
    y: [number, number];
  };
  badgeAnchor: {
    x: number;
    y: number;
  };
}

export const ZONES: Record<Location, ZoneConfig> = {
  'Огород': {
    location: 'Огород',
    hitbox: { x: [790, 1500], y: [515, 780] },
    badgeAnchor: { x: 1500, y: 515 },
  },
  'Теплица': {
    location: 'Теплица',
    hitbox: { x: [850, 1400], y: [115, 455] },
    badgeAnchor: { x: 1400, y: 115 },
  },
  'Сарай': {
    location: 'Сарай',
    hitbox: { x: [1660, 2200], y: [90, 500] },
    badgeAnchor: { x: 2200, y: 90 },
  },
  'Забор — Запад': {
    location: 'Забор — Запад',
    hitbox: { x: [690, 780], y: [420, 560] },
    badgeAnchor: { x: 780, y: 420 },
  },
  'Забор — Юго-Запад': {
    location: 'Забор — Юго-Запад',
    hitbox: { x: [1180, 1290], y: [760, 870] },
    badgeAnchor: { x: 1290, y: 760 },
  },
  'Забор — Юго-Восток': {
    location: 'Забор — Юго-Восток',
    hitbox: { x: [2385, 2470], y: [695, 890] },
    badgeAnchor: { x: 2470, y: 695 },
  },
  'Забор — Восток': {
    location: 'Забор — Восток',
    hitbox: { x: [2600, 2700], y: [420, 520] },
    badgeAnchor: { x: 2700, y: 420 },
  },
};
