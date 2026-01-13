import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
          include: {
            category: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        categories: true
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

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Error fetching dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, slug, isPublic, theme } = await request.json()

    // Check if user owns the dashboard
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingDashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    // Check if slug already exists (excluding current dashboard)
    if (slug !== existingDashboard.slug) {
      const slugExists = await prisma.dashboard.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
      }
    }

    const dashboard = await prisma.dashboard.update({
      where: { id: id },
      data: {
        title,
        description,
        slug,
        isPublic,
        theme
      }
    })

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Error updating dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the dashboard
    const existingDashboard = await prisma.dashboard.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingDashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    await prisma.dashboard.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Dashboard deleted successfully" })
  } catch (error) {
    console.error("Error deleting dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
