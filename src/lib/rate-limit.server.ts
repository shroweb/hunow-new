import { getPool } from "./db.server";

/**
 * Simple DB-backed rate limiter.
 * Returns true if the request is allowed, false if the limit is exceeded.
 *
 * @param key      Unique key, e.g. `signin:user@example.com`
 * @param max      Max allowed attempts in the window
 * @param windowSec  Window size in seconds
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<boolean> {
  try {
    const pool = getPool();
    // Upsert: increment hits for the current window, or start a new window
    const result = await pool.query<{ hits: number }>(
      `insert into rate_limits (key, window_start, hits)
       values ($1, date_trunc('second', now()) - (extract(epoch from now())::int % $3 || ' seconds')::interval, 1)
       on conflict (key, window_start)
       do update set hits = rate_limits.hits + 1
       returning hits`,
      [key, windowSec, windowSec],
    );
    const hits = result.rows[0]?.hits ?? 1;
    return hits <= max;
  } catch {
    // If rate limit table doesn't exist yet, allow the request
    return true;
  }
}
