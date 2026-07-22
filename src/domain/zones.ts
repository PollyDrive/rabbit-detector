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
    // Shifted up+right off its previous bounds, which dipped into the
    // Забор — Юго-Запад sensor box below and sat close to the Забор — Запад
    // sensor to the left.
    hitbox: { x: [830, 1500], y: [515, 755] },
    badgeAnchor: { x: 1500, y: 515 },
  },
  'Теплица': {
    location: 'Теплица',
    hitbox: { x: [850, 1400], y: [115, 455] },
    badgeAnchor: { x: 1400, y: 115 },
  },
  'Сарай': {
    location: 'Сарай',
    hitbox: { x: [1660, 2200], y: [60, 470] },
    badgeAnchor: { x: 2200, y: 60 },
  },
  // Fence sensor hitboxes below are measured directly off the sensor box
  // artwork (device body only, +/- a few px), not the old room-sized
  // rectangles around them.
  'Забор — Запад': {
    location: 'Забор — Запад',
    hitbox: { x: [716, 774], y: [431, 508] },
    badgeAnchor: { x: 774, y: 431 },
  },
  'Забор — Юго-Запад': {
    location: 'Забор — Юго-Запад',
    hitbox: { x: [1216, 1288], y: [763, 836] },
    badgeAnchor: { x: 1288, y: 763 },
  },
  'Забор — Юго-Восток': {
    location: 'Забор — Юго-Восток',
    hitbox: { x: [2405, 2473], y: [766, 843] },
    badgeAnchor: { x: 2473, y: 766 },
  },
  'Забор — Восток': {
    location: 'Забор — Восток',
    hitbox: { x: [2656, 2716], y: [442, 523] },
    badgeAnchor: { x: 2716, y: 442 },
  },
};
