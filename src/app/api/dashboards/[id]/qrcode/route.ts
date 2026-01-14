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

    // Get the host from the request headers
    const host = request.headers.get("host") || "localhost:3000"
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
    const publicUrl = `${protocol}://${host}/public/${dashboard.slug}`

    // Get optional query parameters
    const searchParams = request.nextUrl.searchParams
    const size = parseInt(searchParams.get("size") || "300")
    const format = searchParams.get("format") || "png" // png or svg

    // Generate QR code
    if (format === "svg") {
      const qrCodeSvg = await QRCode.toString(publicUrl, {
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
      const qrCodeBuffer = await QRCode.toBuffer(publicUrl, {
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
