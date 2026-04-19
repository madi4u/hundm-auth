import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SESSION_COOKIE, COOKIE_DOMAIN } from "@/lib/session"

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value

  if (token) {
    await db.session.deleteMany({ where: { sessionToken: token } }).catch(() => {})
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: COOKIE_DOMAIN,
    expires: new Date(0),
    path: "/",
  })

  return res
}
