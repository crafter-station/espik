const isDev = process.env.NODE_ENV === "development";

export const log = {
  info: (...args: unknown[]) => {
    if (isDev) console.log("[espik]", ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn("[espik]", ...args);
  },
  error: (...args: unknown[]) => {
    // Always log errors, but strip prefix in prod
    if (isDev) {
      console.error("[espik]", ...args);
    } else {
      console.error(...args);
    }
  },
};
