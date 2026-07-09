import { LOG_LEVEL } from "./config";
import type { LogLevel } from "./config";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  silent: 3,
};

function shouldLog(level: "debug" | "info" | "warn"): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[LOG_LEVEL];
}

/** Namespaced logger gated by LOG_LEVEL (ТЗ 9.2) — e.g. createLogger('reducer'). */
export function createLogger(namespace: string) {
  return {
    debug: (...args: unknown[]) => {
      if (shouldLog("debug")) console.debug(`[${namespace}]`, ...args);
    },
    info: (...args: unknown[]) => {
      if (shouldLog("info")) console.info(`[${namespace}]`, ...args);
    },
    warn: (...args: unknown[]) => {
      if (shouldLog("warn")) console.warn(`[${namespace}]`, ...args);
    },
  };
}
