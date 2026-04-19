import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { SESSION_COOKIE, COOKIE_DOMAIN, SESSION_TTL_DAYS } from "@/lib/session"

export async function GET(req: NextRequest) {
  const rawToken = req.nextUrl.searchParams.get("token")
  const callbackParam = req.nextUrl.searchParams.get("callback")

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"
  const errorUrl = `${baseUrl}/login?error=invalid_token`

  if (!rawToken) {
    return NextResponse.redirect(errorUrl)
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")

  const token = await db.magicLinkToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!token || token.usedAt || token.expiresAt < new Date()) {
    return NextResponse.redirect(errorUrl)
  }

  if (!token.user.isActive) {
    return NextResponse.redirect(`${baseUrl}/login?error=account_disabled`)
  }

  // Mark token as used
  await db.magicLinkToken.update({
    where: { id: token.id },
    data: { usedAt: new Date() },
  })

  // Find the user's primary org (first org where they're owner/admin)
  const membership = await db.membership.findFirst({
    where: { userId: token.userId },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    include: { org: true },
  })

  const sessionToken = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)

  await db.session.create({
    data: {
      userId: token.userId,
      activeOrgId: membership?.orgId ?? null,
      sessionToken,
      expiresAt,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    },
  })

  // Update last seen
  await db.user.update({
    where: { id: token.userId },
    data: { lastSeenAt: new Date() },
  })

  const destination = callbackParam ?? `${baseUrl}/select-org`

  const res = NextResponse.redirect(destination)
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    domain: COOKIE_DOMAIN,
    expires: expiresAt,
    path: "/",
  })

  return res
}
