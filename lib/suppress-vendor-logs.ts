/**
 * Suppress noisy vendor library console output in production.
 * Call once at app startup (client-side only).
 */
export function suppressVendorLogs() {
  if (process.env.NODE_ENV === "development") return;
  if (typeof window === "undefined") return;

  const noop = () => {};
  const originalLog = console.log;
  const originalWarn = console.warn;

  // Palabra / LiveKit fingerprints
  const VENDOR_PATTERNS = [
    "LiveKit",
    "palabra",
    "setTask",
    "endTask",
    "Track subscribed",
    "Track unsubscribed",
    "Track published",
    "Remote track",
    "disconnect from room",
    "Successfully disconnected",
    "Successfully connected",
    "Remote participant",
    "No session data",
    "handleRemoteAudioTrack",
    "all SIDS",
    "we set sid",
    "Connecting to",
    "Disconnecting from",
    "forward-logs",
  ];

  function isVendorLog(args: unknown[]): boolean {
    return args.some(
      (arg) =>
        typeof arg === "string" &&
        VENDOR_PATTERNS.some((p) => arg.includes(p))
    );
  }

  console.log = (...args: unknown[]) => {
    if (!isVendorLog(args)) originalLog.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    if (!isVendorLog(args)) originalWarn.apply(console, args);
  };
}
