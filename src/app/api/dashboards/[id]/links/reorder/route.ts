import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    const { linkIds } = await request.json()

    if (!Array.isArray(linkIds)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Update the order of each link
    const updatePromises = linkIds.map((linkId, index) =>
      prisma.link.updateMany({
        where: {
          id: linkId,
          dashboardId: id
        },
        data: {
          order: index
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reordering links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
