import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { getSessionFromCookie } from "@/lib/session"
import { db } from "@/lib/db"

export default async function SelectOrgPage() {
  const jar = await cookies()
  const cookieHeader = jar.toString()
  const session = await getSessionFromCookie(cookieHeader)

  if (!session) {
    redirect("/login")
  }

  const memberships = await db.membership.findMany({
    where: { userId: session.userId, acceptedAt: { not: null } },
    include: { org: true },
    orderBy: { createdAt: "asc" },
  })

  if (memberships.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Kein Zugriff</h1>
          <p className="text-gray-500 text-sm">
            Du hast keinen Zugriff auf eine Organisation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Willkommen, {session.name}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Bitte wähle eine Organisation
          </p>
        </div>

        <div className="space-y-3">
          {memberships.map((m) => (
            <a
              key={m.orgId}
              href={`/api/auth/switch-org?orgId=${m.orgId}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 transition-colors"
            >
              <div className="font-semibold text-gray-900">{m.org.displayName}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {m.role} · {m.appsAccess.join(", ")}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
