import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rateLimit, addRateLimitHeaders, createRateLimitErrorResponse, RateLimitConfigs } from "@/lib/rateLimit"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RateLimitConfigs.moderate)
  if (!rateLimitResult.success) {
    return createRateLimitErrorResponse(rateLimitResult)
  }

  try {
    const { id, webhookId } = await params
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

    // Check if webhook belongs to this dashboard
    const existingWebhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        dashboardId: id
      }
    })

    if (!existingWebhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    const { url, events, isActive } = await request.json()

    const webhook = await prisma.webhook.update({
      where: { id: webhookId },
      data: {
        ...(url && { url }),
        ...(events && { events: Array.isArray(events) ? events.join(",") : events }),
        ...(isActive !== undefined && { isActive })
      }
    })

    const response = NextResponse.json(webhook)
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error updating webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RateLimitConfigs.moderate)
  if (!rateLimitResult.success) {
    return createRateLimitErrorResponse(rateLimitResult)
  }

  try {
    const { id, webhookId } = await params
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

    // Check if webhook belongs to this dashboard
    const existingWebhook = await prisma.webhook.findFirst({
      where: {
        id: webhookId,
        dashboardId: id
      }
    })

    if (!existingWebhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 })
    }

    await prisma.webhook.delete({
      where: { id: webhookId }
    })

    const response = NextResponse.json({ success: true })
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
