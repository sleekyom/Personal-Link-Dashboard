import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import QRCode from "qrcode"

export async function GET(
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

    // Get optional query parameters
    const searchParams = request.nextUrl.searchParams
    const size = parseInt(searchParams.get("size") || "300")
    const format = searchParams.get("format") || "png" // png or svg

    // Generate QR code for the link URL
    if (format === "svg") {
      const qrCodeSvg = await QRCode.toString(link.url, {
        type: "svg",
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
      return new NextResponse(qrCodeSvg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600"
        }
      })
    } else {
      const qrCodeBuffer = await QRCode.toBuffer(link.url, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      })
      return new NextResponse(qrCodeBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600"
        }
      })
    }
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
