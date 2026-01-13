import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rateLimit, addRateLimitHeaders, createRateLimitErrorResponse, RateLimitConfigs } from "@/lib/rateLimit"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting (strict for analytics)
  const rateLimitResult = rateLimit(request, RateLimitConfigs.strict)
  if (!rateLimitResult.success) {
    return createRateLimitErrorResponse(rateLimitResult)
  }

  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the dashboard
    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        links: {
          include: {
            clickEvents: true
          }
        }
      }
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    // Parse query parameters for date filtering
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all click events within date range
    const allClickEvents = dashboard.links.flatMap(link =>
      link.clickEvents.filter(event => new Date(event.timestamp) >= startDate)
    )

    // Total stats
    const totalClicks = allClickEvents.length
    const uniqueVisitors = new Set(allClickEvents.map(e => e.ipAddress)).size

    // Device breakdown
    const deviceBreakdown = allClickEvents.reduce((acc, event) => {
      const device = event.device || "Unknown"
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Browser breakdown
    const browserBreakdown = allClickEvents.reduce((acc, event) => {
      const browser = event.browser || "Unknown"
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // OS breakdown
    const osBreakdown = allClickEvents.reduce((acc, event) => {
      const os = event.os || "Unknown"
      acc[os] = (acc[os] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top referrers
    const referrerBreakdown = allClickEvents
      .filter(e => e.referrer)
      .reduce((acc, event) => {
        const referrer = event.referrer || "Direct"
        acc[referrer] = (acc[referrer] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const topReferrers = Object.entries(referrerBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))

    // Time series data (clicks per day)
    const clicksByDay = allClickEvents.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const timeSeriesData = Object.entries(clicksByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    // Top performing links
    const linkStats = dashboard.links.map(link => {
      const linkClicks = link.clickEvents.filter(
        event => new Date(event.timestamp) >= startDate
      )
      return {
        id: link.id,
        title: link.title,
        clicks: linkClicks.length,
        totalClicks: link.clickCount
      }
    }).sort((a, b) => b.clicks - a.clicks)

    const response = NextResponse.json({
      summary: {
        totalClicks,
        uniqueVisitors,
        totalLinks: dashboard.links.length,
        dateRange: {
          start: startDate.toISOString(),
          end: new Date().toISOString(),
          days
        }
      },
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      topReferrers,
      timeSeriesData,
      linkStats
    })

    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
