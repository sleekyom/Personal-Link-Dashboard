import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rateLimit, addRateLimitHeaders, createRateLimitErrorResponse, RateLimitConfigs } from "@/lib/rateLimit"
import { triggerWebhook } from "@/lib/webhook"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        links: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    // Check if dashboard is public or user owns it
    const session = await getServerSession(authOptions)
    if (!dashboard.isPublic && session?.user?.id !== dashboard.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(dashboard.links)
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Apply rate limiting (moderate)
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

    const { title, url, description, categoryId } = await request.json()

    // Get the highest order number for this dashboard
    const lastLink = await prisma.link.findFirst({
      where: { dashboardId: id },
      orderBy: { order: 'desc' }
    })

    const newOrder = lastLink ? lastLink.order + 1 : 0

    const link = await prisma.link.create({
      data: {
        title,
        url,
        description,
        order: newOrder,
        dashboardId: id,
        ...(categoryId && { categoryId })
      },
      include: {
        category: true
      }
    })

    // Trigger webhook
    triggerWebhook(id, "link.created", {
      linkId: link.id,
      title: link.title,
      url: link.url,
      description: link.description
    })

    const response = NextResponse.json(link)
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error creating link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
