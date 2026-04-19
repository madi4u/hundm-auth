import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  const memberships = await db.membership.findMany({
    where: { userId, acceptedAt: { not: null } },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  })

  const result = memberships.map((m) => ({
    orgId: m.orgId,
    orgName: m.org.name,
    orgSlug: m.org.slug,
    role: m.role,
    appsAccess: m.appsAccess,
    rolePerApp: m.rolePerApp,
  }))

  return NextResponse.json(result)
}
