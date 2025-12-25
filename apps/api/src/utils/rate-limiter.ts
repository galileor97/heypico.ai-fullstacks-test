import { env } from "../env";

export interface RateLimiterConfig {
  // Maximum requests allowed in the time window
  maxRequests: number;
  // Time window in milliseconds
  windowMs: number;
}

export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  // Check if a new request can be made within the rate limit
  canMakeRequest(): boolean {
    this.cleanupOldRequests();
    return this.requests.length < this.maxRequests;
  }

  /**
   * Record a new request timestamp
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }

  // Get the number of remaining requests in the current window
  getRemainingRequests(): number {
    this.cleanupOldRequests();
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  // Get time until the oldest request expires (in ms)
  getResetTime(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }

  /**
   * Remove requests that are outside the current time window
   */
  private cleanupOldRequests(): void {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);
  }
}

// Pre-configured rate limiter for Google Places API
// 100 requests per minute to prevent excessive API costs
export const placesRateLimiter = new RateLimiter({
  maxRequests: env.GOOGLE_PLACES_RATE_LIMIT,
  windowMs: env.GOOGLE_PLACES_RATE_LIMIT_WINDOW,
});
