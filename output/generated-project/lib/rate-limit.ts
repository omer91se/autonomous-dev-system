import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Create Redis client (will use environment variables automatically)
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

// Only create Redis/Ratelimit if credentials are available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
    analytics: true,
    prefix: '@upstash/ratelimit',
  });
}

// Strict rate limiter for auth endpoints
let authRatelimit: Ratelimit | null = null;

if (redis) {
  authRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 requests per 15 minutes
    analytics: true,
    prefix: '@upstash/ratelimit/auth',
  });
}

/**
 * Rate limiting middleware for API routes
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  options?: { strict?: boolean }
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // If Redis is not configured, allow all requests (for development)
  if (!ratelimit) {
    console.warn('⚠️  Rate limiting is not configured (missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN)');
    return { success: true };
  }

  const limiter = options?.strict && authRatelimit ? authRatelimit : ratelimit;

  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset: Math.floor(reset / 1000), // Convert to seconds
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request to prevent blocking legitimate users
    return { success: true };
  }
}

/**
 * Get identifier for rate limiting (IP or user ID)
 */
export function getRateLimitIdentifier(request: NextRequest, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }

  // Otherwise use IP address
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'anonymous';

  return `ip:${ip}`;
}

/**
 * Create rate limit response
 */
export function createRateLimitResponse(resetTime: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: resetTime,
    },
    {
      status: 429,
      headers: {
        'Retry-After': resetTime.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
      },
    }
  );
}

/**
 * Middleware wrapper for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: { strict?: boolean; userId?: string }
): Promise<NextResponse> {
  const identifier = getRateLimitIdentifier(request, options?.userId);
  const result = await checkRateLimit(identifier, { strict: options?.strict });

  if (!result.success) {
    return createRateLimitResponse(result.reset || 60);
  }

  // Add rate limit headers to response
  const response = await handler();

  if (result.limit !== undefined) {
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
  }
  if (result.remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  }
  if (result.reset !== undefined) {
    response.headers.set('X-RateLimit-Reset', result.reset.toString());
  }

  return response;
}
