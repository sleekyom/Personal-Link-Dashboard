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

    const { title, url, description, order } = await request.json()

    // Check if user owns the link's dashboard
    const link = await prisma.link.findFirst({
      where: { id: id },
      include: {
        dashboard: true
      }
    })

    if (!link || link.dashboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    const updatedLink = await prisma.link.update({
      where: { id: id },
      data: {
        title,
        url,
        description,
        order: order !== undefined ? order : link.order
      }
    })

    return NextResponse.json(updatedLink)
  } catch (error) {
    console.error("Error updating link:", error)
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

    // Check if user owns the link's dashboard
    const link = await prisma.link.findFirst({
      where: { id: id },
      include: {
        dashboard: true
      }
    })

    if (!link || link.dashboard.userId !== session.user.id) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    await prisma.link.delete({
      where: { id: id }
    })

    return NextResponse.json({ message: "Link deleted successfully" })
  } catch (error) {
    console.error("Error deleting link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
