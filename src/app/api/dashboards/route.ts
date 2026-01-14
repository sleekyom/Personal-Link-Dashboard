import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { rateLimit, addRateLimitHeaders, createRateLimitErrorResponse, RateLimitConfigs } from "@/lib/rateLimit"

export async function GET(request: NextRequest) {
  // Apply rate limiting (moderate)
  const rateLimitResult = rateLimit(request, RateLimitConfigs.moderate)
  if (!rateLimitResult.success) {
    return createRateLimitErrorResponse(rateLimitResult)
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dashboards = await prisma.dashboard.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        links: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    const response = NextResponse.json(dashboards)
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error fetching dashboards:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Apply rate limiting (moderate)
  const rateLimitResult = rateLimit(request, RateLimitConfigs.moderate)
  if (!rateLimitResult.success) {
    return createRateLimitErrorResponse(rateLimitResult)
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, slug, isPublic, theme } = await request.json()

    // Check if slug already exists
    const existingDashboard = await prisma.dashboard.findUnique({
      where: { slug }
    })

    if (existingDashboard) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        title,
        description,
        slug,
        isPublic: isPublic || false,
        theme: theme || "default",
        userId: session.user.id
      }
    })

    const response = NextResponse.json(dashboard)
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    console.error("Error creating dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
