import { NextRequest, NextResponse } from "next/server"
import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieHeader = req.headers.get("cookie") ?? ""
  const session = await getSessionFromCookie(cookieHeader)

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"

  if (!session || !session.isSuperadmin) {
    return NextResponse.redirect(`${baseUrl}/login`, { status: 303 })
  }

  const { id } = await params

  // Safety: prevent self-deletion
  if (id === session.userId) {
    return NextResponse.redirect(`${baseUrl}/admin/users/${id}?error=self-delete`, { status: 303 })
  }

  try {
    // Nullify nullable FKs in fleethub that lack ON DELETE CASCADE
    await db.$executeRaw`UPDATE fleethub.vehicle_history_entries SET author_user_id = NULL WHERE author_user_id = ${id}`
    await db.$executeRaw`UPDATE fleethub.mileage_entries SET user_id = NULL WHERE user_id = ${id}`
    // Delete rows with NOT NULL FKs in fleethub that lack ON DELETE CASCADE
    await db.$executeRaw`DELETE FROM fleethub.profiles WHERE user_id = ${id}`
    await db.$executeRaw`DELETE FROM fleethub.user_tenant_memberships WHERE user_id = ${id}`
    await db.user.delete({ where: { id } })
  } catch (err) {
    console.error("[delete-user] error:", err)
    return NextResponse.redirect(`${baseUrl}/admin/users/${id}?error=delete-failed`, { status: 303 })
  }

  return NextResponse.redirect(`${baseUrl}/admin/users?deleted=1`, { status: 303 })
}
