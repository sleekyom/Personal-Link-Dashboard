import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rateLimit, addRateLimitHeaders, createRateLimitErrorResponse, RateLimitConfigs } from "@/lib/rateLimit"
import { testWebhook } from "@/lib/webhook"
import crypto from "crypto"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RateLimitConfigs.moderate)
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
      }
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    const webhooks = await prisma.webhook.findMany({
      where: {
        dashboardId: id
      },
      include: {
        _count: {
          select: { deliveries: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const response = NextResponse.json(webhooks)
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RateLimitConfigs.moderate)
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
      }
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    const { url, events, generateSecret } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "At least one event is required" }, { status: 400 })
    }

    // Generate secret if requested
    let secret = null
    if (generateSecret) {
      secret = crypto.randomBytes(32).toString("hex")
    }

    // Test webhook before creating
    const testResult = await testWebhook(url, secret || undefined)
    if (!testResult.success) {
      return NextResponse.json({
        error: "Webhook test failed",
        message: testResult.message
      }, { status: 400 })
    }

    const webhook = await prisma.webhook.create({
      data: {
        url,
        events: events.join(","),
        secret,
        dashboardId: id
      }
    })

    const response = NextResponse.json(webhook)
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error creating webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
