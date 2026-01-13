import { NextRequest, NextResponse } from "next/server"

interface RateLimitData {
  count: number
  resetTime: number
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitData>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  identifier?: string // Optional custom identifier
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

/**
 * Rate limiting function using sliding window algorithm
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowMs
  const maxRequests = config.maxRequests

  // Generate identifier from IP address or custom identifier
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "unknown"
  const identifier = config.identifier || ip
  const key = `${identifier}:${request.nextUrl.pathname}`

  // Get or create rate limit data
  let data = rateLimitStore.get(key)

  if (!data || data.resetTime < now) {
    // Create new window
    data = {
      count: 0,
      resetTime: now + windowMs
    }
  }

  data.count++
  rateLimitStore.set(key, data)

  const remaining = Math.max(0, maxRequests - data.count)
  const success = data.count <= maxRequests

  return {
    success,
    limit: maxRequests,
    remaining,
    reset: data.resetTime
  }
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  result: RateLimitResult
): NextResponse {
  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.reset.toString())
  return response
}

/**
 * Create rate limit error response
 */
export function createRateLimitErrorResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

  const response = NextResponse.json(
    {
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter
    },
    { status: 429 }
  )

  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", "0")
  response.headers.set("X-RateLimit-Reset", result.reset.toString())
  response.headers.set("Retry-After", retryAfter.toString())

  return response
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limit for expensive operations (analytics)
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 20 // 20 requests per 15 minutes
  },
  // Moderate rate limit for authenticated endpoints
  moderate: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100 // 100 requests per 15 minutes
  },
  // Lenient rate limit for public endpoints
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300 // 300 requests per 15 minutes
  },
  // Very lenient for click tracking (high volume)
  tracking: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 requests per minute
  }
}
