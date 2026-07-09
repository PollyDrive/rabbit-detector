import { LOG_LEVEL, type LogLevel } from "./config";

const ORDER: Record<LogLevel, number> = {
  silent: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

export function createLogger(namespace: string) {
  const currentLevel = ORDER[LOG_LEVEL];

  return {
    debug: (...args: unknown[]) => {
      if (currentLevel >= ORDER.debug) {
        console.debug(`[${namespace}]`, ...args);
      }
    },
    info: (...args: unknown[]) => {
      if (currentLevel >= ORDER.info) {
        console.info(`[${namespace}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (currentLevel >= ORDER.warn) {
        console.warn(`[${namespace}]`, ...args);
      }
    },
  };
}
