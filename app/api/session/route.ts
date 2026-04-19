import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie, sessionToPublic } from "@/lib/session"

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? ""
  const session = await getSessionFromCookie(cookieHeader)
  const pub = sessionToPublic(session)

  if (!pub) {
    return NextResponse.json(null, { status: 401 })
  }

  return NextResponse.json(pub)
}
