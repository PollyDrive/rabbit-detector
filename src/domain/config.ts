// Tunable runtime parameters — single source of truth, no magic numbers
// scattered through the reducer or components.

/** Anti-spam guard: minimum ms between user-triggered dispatches (ТЗ 9.1). */
export const ANTI_SPAM_INTERVAL_MS = 200;

/** Game clock starts pre-seeded with 1 hour of history (ТЗ 3.7). */
export const INITIAL_GAME_TIME_S = 3600;

/** Fast-forward advances the game clock by exactly one hour (ТЗ 3.6). */
export const FAST_FORWARD_STEP_S = 3600;

/** Default intensity pre-filled in the manual input form. */
export const DEFAULT_INTENSITY = 5;

/** Below this viewport width, the app shows the desktop-only notice. */
export const MOBILE_BREAKPOINT_PX = 768;
