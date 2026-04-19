import { db } from "./db"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "hundm_session"
export const COOKIE_DOMAIN = process.env.AUTH_COOKIE_DOMAIN ?? ".hundm.cloud"
export const SESSION_TTL_DAYS = 30

export async function getSessionFromCookie(cookieHeader?: string) {
  let token: string | undefined

  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))
    token = match?.[1]
  } else {
    try {
      const jar = await cookies()
      token = jar.get(SESSION_COOKIE)?.value
    } catch {
      return null
    }
  }

  if (!token) return null

  const session = await db.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: true,
      org: true,
    },
  })

  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }

  await db.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() },
  })

  return {
    userId: session.userId,
    email: session.user.email,
    name: session.user.name,
    isSuperadmin: session.user.isSuperadmin,
    activeOrgId: session.activeOrgId,
    activeOrgName: session.org?.displayName ?? null,
    sessionId: session.id,
  }
}

export function sessionToPublic(session: Awaited<ReturnType<typeof getSessionFromCookie>>) {
  if (!session) return null
  const { sessionId: _s, ...pub } = session
  return pub
}
