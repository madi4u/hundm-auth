import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendMagicLink } from "@/lib/email"

const APPS = [
  { id: "fleethub", label: "FleetHub",      color: "#FF9F1C" },
  { id: "eventhub", label: "EventHub",      color: "#FF4785" },
  { id: "gastnote", label: "GastNote",      color: "#0DBFA8" },
  { id: "cfo",      label: "CFO Dashboard", color: "#5B5FE8" },
]

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ sent?: string; error?: string; confirm?: string }>
}) {
  const { id } = await params
  const { sent, error: qError, confirm } = await searchParams

  const [user, allOrgs] = await Promise.all([
    db.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { org: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.organization.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  if (!user) notFound()

  const memberOrgIds = new Set(user.memberships.map((m) => m.orgId))
  const availableOrgs = allOrgs.filter((o) => !memberOrgIds.has(o.id))

  async function updateUser(formData: FormData) {
    "use server"
    const name = (formData.get("name") as string).trim()
    const email = (formData.get("email") as string).trim().toLowerCase()
    const isSuperadmin = formData.get("isSuperadmin") === "on"
    const isActive = formData.get("isActive") === "on"
    await db.user.update({ where: { id }, data: { name, email, isSuperadmin, isActive } })
    redirect(`/admin/users/${id}`)
  }

  async function deleteMembership(formData: FormData) {
    "use server"
    const membershipId = formData.get("membershipId") as string
    await db.membership.delete({ where: { id: membershipId } })
    redirect(`/admin/users/${id}`)
  }

  async function sendLoginLink(_formData: FormData) {
    "use server"
    if (!user.isActive) redirect(`/admin/users/${id}?error=inactive`)

    await db.magicLinkToken.deleteMany({ where: { userId: id, usedAt: null } })

    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.magicLinkToken.create({
      data: { userId: id, email: user.email, tokenHash, expiresAt },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"
    const link = `${baseUrl}/api/auth/verify?token=${rawToken}`
    await sendMagicLink({ to: user.email, link, name: user.name })

    redirect(`/admin/users/${id}?sent=1`)
  }

  async function deleteUser(_formData: FormData) {
    "use server"
    // Remove cross-schema memberships first (FK without CASCADE in other app schemas)
    await db.$executeRaw`DELETE FROM fleethub.user_tenant_memberships WHERE user_id = ${id}`
    await db.user.delete({ where: { id } })
    redirect("/admin/users")
  }

  async function addMembership(formData: FormData) {
    "use server"
    const orgId = formData.get("orgId") as string
    const role = formData.get("role") as string
    const appsAccess = formData.getAll("appsAccess") as string[]
    if (!orgId) redirect(`/admin/users/${id}`)
    await db.membership.create({
      data: {
        userId: id,
        orgId,
        role,
        appsAccess,
        rolePerApp: {},
        acceptedAt: new Date(),
      },
    })
    redirect(`/admin/users/${id}`)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
        >
          ← Zurück zu Nutzern
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-display">{user.name}</h1>
            {user.isSuperadmin && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">
                Superadmin
              </span>
            )}
            {!user.isActive && (
              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded font-medium border border-border">
                Deaktiviert
              </span>
            )}
          </div>
          <form action={sendLoginLink}>
            <button
              type="submit"
              disabled={!user.isActive}
              className="px-3 py-1.5 border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Login-Link senden
            </button>
          </form>
        </div>
        <p className="text-muted-foreground text-sm mt-1 font-mono">{user.email}</p>
      </div>

      {sent === "1" && (
        <div className="mb-5 px-4 py-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          Login-Link wurde an {user.email} gesendet (gültig 24 Stunden).
        </div>
      )}
      {qError === "inactive" && (
        <div className="mb-5 px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Deaktivierte Nutzer können keinen Login-Link erhalten.
        </div>
      )}

      {/* Edit form */}
      <form action={updateUser} className="bg-card border border-border rounded-lg p-6 mb-5 space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Nutzerdaten
        </h2>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Name</label>
          <input
            id="name" name="name" type="text" required defaultValue={user.name}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">E-Mail</label>
          <input
            id="email" name="email" type="email" required defaultValue={user.email}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-8 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="isActive" type="checkbox" defaultChecked={user.isActive}
              className="w-4 h-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-medium text-foreground">Aktiv</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="isSuperadmin" type="checkbox" defaultChecked={user.isSuperadmin}
              className="w-4 h-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-medium text-foreground">Superadmin</span>
          </label>
        </div>

        <div className="pt-2 border-t border-border">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-brand-operatorDeep transition-colors"
          >
            Speichern
          </button>
        </div>
      </form>

      {/* Delete confirmation */}
      {confirm === "delete" ? (
        <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 mb-5">
          <h2 className="text-sm font-semibold text-destructive mb-1">Nutzer wirklich löschen?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            <strong className="text-foreground">{user.name}</strong> ({user.email}) wird dauerhaft gelöscht –
            inklusive aller {user.memberships.length} Organisationszugehörigkeit
            {user.memberships.length !== 1 ? "en" : ""}, Sessions und Login-Tokens.
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          <div className="flex gap-3">
            <form action={deleteUser}>
              <button
                type="submit"
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Ja, Nutzer löschen
              </button>
            </form>
            <Link
              href={`/admin/users/${id}`}
              className="px-4 py-2 border border-border text-foreground rounded-md text-sm hover:bg-muted transition-colors"
            >
              Abbrechen
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-5 flex justify-end">
          <Link
            href={`/admin/users/${id}?confirm=delete`}
            className="text-xs text-destructive hover:underline"
          >
            Nutzer löschen…
          </Link>
        </div>
      )}

      {/* Memberships */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Organisationen ({user.memberships.length})
        </h2>

        {user.memberships.length === 0 ? (
          <p className="text-muted-foreground text-sm mb-4">Noch keiner Organisation zugewiesen.</p>
        ) : (
          <div className="divide-y divide-border mb-2">
            {user.memberships.map((m) => (
              <div key={m.id} className="flex items-start justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{m.org.displayName}</div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[11px] rounded border border-border">
                      {m.role}
                    </span>
                    {m.appsAccess.map((a) => (
                      <span key={a} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <form action={deleteMembership}>
                  <input type="hidden" name="membershipId" value={m.id} />
                  <button
                    type="submit"
                    className="text-xs text-destructive hover:underline mt-0.5"
                  >
                    Entfernen
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {availableOrgs.length > 0 && (
          <form action={addMembership} className="border-t border-border pt-5 mt-2 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Zu Organisation hinzufügen
            </h3>
            <div className="flex gap-2 flex-wrap">
              <select
                name="orgId" required
                className="px-3 py-1.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Organisation wählen…</option>
                {availableOrgs.map((o) => (
                  <option key={o.id} value={o.id}>{o.displayName}</option>
                ))}
              </select>
              <select
                name="role"
                className="px-3 py-1.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">App-Zugriff:</p>
              <div className="flex gap-4 flex-wrap">
                {APPS.map((app) => (
                  <label key={app.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" name="appsAccess" value={app.id}
                      className="w-3.5 h-3.5 rounded accent-primary" />
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: app.color }} />
                      {app.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-brand-operatorDeep transition-colors"
            >
              Hinzufügen
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
