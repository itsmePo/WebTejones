interface RateLimitStore {
  [ip: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const record = store[ip];

  if (!record || now > record.resetTime) {
    store[ip] = { count: 1, resetTime: now + windowMs };
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
