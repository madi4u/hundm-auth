import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SESSION_COOKIE, COOKIE_DOMAIN } from "@/lib/session"

function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: COOKIE_DOMAIN,
    expires: new Date(0),
    path: "/",
  })
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { sessionToken: token } }).catch(() => {})
  }
  const res = NextResponse.redirect(new URL("/", req.url))
  clearSessionCookie(res)
  return res
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    await db.session.deleteMany({ where: { sessionToken: token } }).catch(() => {})
  }
  const res = NextResponse.json({ success: true })
  clearSessionCookie(res)
  return res
}
