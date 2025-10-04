import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const dashboard = await prisma.dashboard.findUnique({
      where: {
        slug: params.slug,
        isPublic: true
      },
      include: {
        links: {
          where: {
            isActive: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!dashboard) {
      return NextResponse.json({ error: "Dashboard not found" }, { status: 404 })
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("Error fetching public dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
