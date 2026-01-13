import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit, addRateLimitHeaders, createRateLimitErrorResponse, RateLimitConfigs } from "@/lib/rateLimit"

// Helper function to parse user agent
function parseUserAgent(userAgent: string | null) {
  if (!userAgent) return { device: null, browser: null, os: null }

  // Device detection
  let device = "Desktop"
  if (/mobile/i.test(userAgent)) device = "Mobile"
  if (/tablet|ipad/i.test(userAgent)) device = "Tablet"

  // Browser detection
  let browser = "Unknown"
  if (/edg/i.test(userAgent)) browser = "Edge"
  else if (/chrome/i.test(userAgent)) browser = "Chrome"
  else if (/safari/i.test(userAgent)) browser = "Safari"
  else if (/firefox/i.test(userAgent)) browser = "Firefox"
  else if (/opera|opr/i.test(userAgent)) browser = "Opera"

  // OS detection
  let os = "Unknown"
  if (/windows/i.test(userAgent)) os = "Windows"
  else if (/mac os/i.test(userAgent)) os = "macOS"
  else if (/linux/i.test(userAgent)) os = "Linux"
  else if (/android/i.test(userAgent)) os = "Android"
  else if (/ios|iphone|ipad/i.test(userAgent)) os = "iOS"

  return { device, browser, os }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting (tracking - high volume allowed)
  const rateLimitResult = rateLimit(request, RateLimitConfigs.tracking)
  if (!rateLimitResult.success) {
    return createRateLimitErrorResponse(rateLimitResult)
  }

  try {
    const { id } = await params
    const link = await prisma.link.findUnique({
      where: { id }
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Extract analytics data
    const userAgent = request.headers.get("user-agent")
    const referrer = request.headers.get("referer") || request.headers.get("referrer")
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0] ||
                      request.headers.get("x-real-ip") ||
                      "unknown"

    const { device, browser, os } = parseUserAgent(userAgent)

    // Create click event with detailed analytics
    await prisma.clickEvent.create({
      data: {
        linkId: id,
        referrer,
        userAgent,
        ipAddress,
        device,
        browser,
        os
      }
    })

    // Increment click count for backwards compatibility
    const updatedLink = await prisma.link.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1
        }
      }
    })

    const response = NextResponse.json({ clickCount: updatedLink.clickCount })
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error tracking click:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
