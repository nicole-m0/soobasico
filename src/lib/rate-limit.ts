// Local/single-instance protection. Replace with a shared store before multi-instance deployment.
const globalRateLimit = globalThis as unknown as { orderAttempts?: Map<string, { count: number; expires: number }> };
const attempts = globalRateLimit.orderAttempts ?? new Map<string, { count: number; expires: number }>();
globalRateLimit.orderAttempts = attempts;
export function allowOrderRequest(key: string, now = Date.now()) {
  for (const [id, entry] of attempts) if (entry.expires <= now) attempts.delete(id);
  const entry = attempts.get(key);
  if (entry && entry.count >= 12) return false;
  if (!entry) {
    if (attempts.size >= 10_000) return false;
    attempts.set(key, { count: 1, expires: now + 60_000 });
  } else entry.count++;
  return true;
}
