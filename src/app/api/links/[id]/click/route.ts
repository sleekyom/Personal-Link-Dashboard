import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const link = await prisma.link.findUnique({
      where: { id: params.id }
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Increment click count
    const updatedLink = await prisma.link.update({
      where: { id: params.id },
      data: {
        clickCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ clickCount: updatedLink.clickCount })
  } catch (error) {
    console.error("Error tracking click:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
