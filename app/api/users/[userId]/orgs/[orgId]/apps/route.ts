import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; orgId: string }> }
) {
  const { userId, orgId } = await params

  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ apps: [] })

  if (user.isSuperadmin) {
    const org = await db.organization.findUnique({ where: { id: orgId } })
    return NextResponse.json({ apps: org?.appsEnabled ?? [] })
  }

  const membership = await db.membership.findUnique({
    where: { userId_orgId: { userId, orgId } },
    include: { org: true },
  })

  if (!membership) return NextResponse.json({ apps: [] })

  const apps = membership.appsAccess.filter((a) =>
    membership.org.appsEnabled.includes(a)
  )

  return NextResponse.json({ apps })
}
