import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

const AUTH_SERVICE_URL = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId, appId } = await req.json()

    if (!userId || !orgId || !appId) {
      return NextResponse.json(
        { allowed: false, reason: "not_authenticated" },
        { status: 400 }
      )
    }

    const org = await db.organization.findUnique({ where: { id: orgId } })
    if (!org) {
      return NextResponse.json({ allowed: false, reason: "org_not_found" })
    }
    if (!org.isActive) {
      return NextResponse.json({ allowed: false, reason: "org_inactive" })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || !user.isActive) {
      return NextResponse.json({ allowed: false, reason: "not_authenticated" })
    }

    // Superadmins bypass all checks
    if (user.isSuperadmin) {
      const rolePerApp = (membership?.rolePerApp ?? {}) as Record<string, string>
      const appRole = rolePerApp[appId] ?? "SUPERADMIN"
      return NextResponse.json({
        allowed: true,
        reason: "ok",
        appRole,
      })
    }

    const membership = await db.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    })

    if (!membership || !membership.acceptedAt) {
      return NextResponse.json({ allowed: false, reason: "no_membership" })
    }

    if (!membership.appsAccess.includes(appId)) {
      return NextResponse.json({
        allowed: false,
        reason: "no_app_access",
        redirectUrl: `${AUTH_SERVICE_URL}/no-access`,
      })
    }

    const rolePerApp = membership.rolePerApp as Record<string, string>
    const appRole = rolePerApp[appId] ?? membership.role

    return NextResponse.json({ allowed: true, reason: "ok", appRole })
  } catch (err) {
    console.error("[access/check] error:", err)
    return NextResponse.json(
      { allowed: false, reason: "not_authenticated" },
      { status: 500 }
    )
  }
}
