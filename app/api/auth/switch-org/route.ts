import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SESSION_COOKIE, COOKIE_DOMAIN, getSessionFromCookie } from "@/lib/session"

export async function GET(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie") ?? ""
  const session = await getSessionFromCookie(cookieHeader)

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"

  if (!session) {
    return NextResponse.redirect(`${baseUrl}/login`)
  }

  const orgId = req.nextUrl.searchParams.get("orgId")
  const callbackParam = req.nextUrl.searchParams.get("callback")

  if (!orgId) {
    return NextResponse.redirect(`${baseUrl}/select-org`)
  }

  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId: session.userId, orgId } },
  })

  if (!membership && !session.isSuperadmin) {
    return NextResponse.redirect(`${baseUrl}/select-org`)
  }

  await db.session.update({
    where: { id: session.sessionId },
    data: { activeOrgId: orgId },
  })

  // Default to fleethub if no callback — better than pointing at the root domain
  const destination = callbackParam ?? "https://fleethub.hundm.cloud"
  return NextResponse.redirect(destination)
}
