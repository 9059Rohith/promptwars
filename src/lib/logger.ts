/**
 * Minimal structured logger. Emits single-line JSON in production (easy to
 * ingest in Vercel/Datadog) and readable lines in development. Swap the sink
 * here to integrate a hosted logging provider without touching call sites.
 */
type Level = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

function emit(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry = { level, message, time: new Date().toISOString(), ...meta };
  const line = isProd ? JSON.stringify(entry) : `[${level}] ${message}`;
  if (level === "error") console.error(line, !isProd && meta ? meta : "");
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (m: string, meta?: Record<string, unknown>) => !isProd && emit("debug", m, meta),
  info: (m: string, meta?: Record<string, unknown>) => emit("info", m, meta),
  warn: (m: string, meta?: Record<string, unknown>) => emit("warn", m, meta),
  error: (m: string, meta?: Record<string, unknown>) => emit("error", m, meta),
};
