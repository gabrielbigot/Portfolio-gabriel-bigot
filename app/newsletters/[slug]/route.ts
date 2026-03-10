import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const filePath = path.join(process.cwd(), "public", "newsletters", `${slug}.html`)

  try {
    const html = fs.readFileSync(filePath, "utf-8")
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
