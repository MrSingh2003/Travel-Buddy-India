type Bucket = { tokens: number; lastRefill: number }

export class TokenBucketLimiter {
  private buckets = new Map<string, Bucket>()
  constructor(private capacity: number, private refillPerSec: number) {}

  allow(key: string): boolean {
    const now = Date.now()
    const bucket = this.buckets.get(key) ?? { tokens: this.capacity, lastRefill: now }
    const elapsedSec = (now - bucket.lastRefill) / 1000
    const refill = elapsedSec * this.refillPerSec
    bucket.tokens = Math.min(this.capacity, bucket.tokens + refill)
    bucket.lastRefill = now
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1
      this.buckets.set(key, bucket)
      return true
    }
    this.buckets.set(key, bucket)
    return false
  }
}

export const exploreLimiter = new TokenBucketLimiter(10, 1) // burst 10, 1 rps


