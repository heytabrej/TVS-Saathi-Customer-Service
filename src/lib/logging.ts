// Lightweight structured logging helper (server side only)
interface LogBase { level: 'info' | 'warn' | 'error'; msg: string; [k: string]: any }

export function log(entry: LogBase) {
  const safe = { ...entry, ts: new Date().toISOString() };
  try {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(safe));
  } catch (e) {
    console.log(`[log-fallback] ${entry.level} ${entry.msg}`);
  }
}
