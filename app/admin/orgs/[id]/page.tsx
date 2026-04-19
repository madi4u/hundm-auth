import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"

const APPS = [
  { id: "fleethub", label: "FleetHub",      color: "#FF9F1C" },
  { id: "eventhub", label: "EventHub",      color: "#FF4785" },
  { id: "gastnote", label: "GastNote",      color: "#0DBFA8" },
  { id: "cfo",      label: "CFO Dashboard", color: "#5B5FE8" },
]

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [org, allUsers] = await Promise.all([
    db.organization.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.user.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ])

  if (!org) notFound()

  const memberUserIds = new Set(org.memberships.map((m) => m.userId))
  const availableUsers = allUsers.filter((u) => !memberUserIds.has(u.id))

  async function updateOrg(formData: FormData) {
    "use server"
    const name        = (formData.get("name") as string).trim()
    const displayName = (formData.get("displayName") as string).trim()
    const slug        = (formData.get("slug") as string).trim().toLowerCase()
    const plan        = formData.get("plan") as string
    const isActive    = formData.get("isActive") === "on"
    const appsEnabled = formData.getAll("appsEnabled") as string[]
    await db.organization.update({
      where: { id },
      data: { name, displayName, slug, plan, isActive, appsEnabled },
    })
    redirect(`/admin/orgs/${id}`)
  }

  async function removeMember(formData: FormData) {
    "use server"
    const membershipId = formData.get("membershipId") as string
    await db.membership.delete({ where: { id: membershipId } })
    redirect(`/admin/orgs/${id}`)
  }

  async function addMember(formData: FormData) {
    "use server"
    const userId     = formData.get("userId") as string
    const role       = formData.get("role") as string
    const appsAccess = formData.getAll("appsAccess") as string[]
    if (!userId) redirect(`/admin/orgs/${id}`)
    await db.membership.create({
      data: {
        userId,
        orgId: id,
        role,
        appsAccess,
        rolePerApp: {},
        acceptedAt: new Date(),
      },
    })
    redirect(`/admin/orgs/${id}`)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/admin/orgs"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
        >
          ← Zurück zu Organisationen
        </Link>
        <div className="flex items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold tracking-tight font-display">{org.displayName}</h1>
          {!org.isActive && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded font-medium border border-border">
              Inaktiv
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1 font-mono">{org.slug}</p>
      </div>

      {/* Edit form */}
      <form action={updateOrg} className="bg-card border border-border rounded-lg p-6 mb-5 space-y-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Organisationsdaten
        </h2>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
            Anzeigename
          </label>
          <input
            id="displayName" name="displayName" type="text" required defaultValue={org.displayName}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
              Interner Name
            </label>
            <input
              id="name" name="name" type="text" required defaultValue={org.name}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
            <input
              id="slug" name="slug" type="text" required defaultValue={org.slug}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label htmlFor="plan" className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
            <select
              id="plan" name="plan" defaultValue={org.plan}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                name="isActive" type="checkbox" defaultChecked={org.isActive}
                className="w-4 h-4 rounded border-input accent-primary"
              />
              <span className="text-sm font-medium text-foreground">Aktiv</span>
            </label>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Apps aktiviert</p>
          <div className="grid grid-cols-2 gap-2">
            {APPS.map((app) => (
              <label
                key={app.id}
                className="flex items-center gap-2.5 px-3 py-2.5 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox" name="appsEnabled" value={app.id}
                  defaultChecked={org.appsEnabled.includes(app.id)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: app.color }} />
                  <span className="text-sm font-medium">{app.label}</span>
                </div>
              </label>
            ))}
          </div>
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

      {/* Members */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Mitglieder ({org.memberships.length})
        </h2>

        {org.memberships.length === 0 ? (
          <p className="text-muted-foreground text-sm mb-2">Noch keine Mitglieder.</p>
        ) : (
          <div className="divide-y divide-border mb-2">
            {org.memberships.map((m) => (
              <div key={m.id} className="flex items-start justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{m.user.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{m.user.email}</div>
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
                <form action={removeMember}>
                  <input type="hidden" name="membershipId" value={m.id} />
                  <button type="submit" className="text-xs text-destructive hover:underline mt-0.5">
                    Entfernen
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        {availableUsers.length > 0 && (
          <form action={addMember} className="border-t border-border pt-5 mt-2 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Mitglied hinzufügen
            </h3>
            <div className="flex gap-2 flex-wrap">
              <select
                name="userId" required
                className="px-3 py-1.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Nutzer wählen…</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} — {u.email}</option>
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
            {org.appsEnabled.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">App-Zugriff erteilen:</p>
                <div className="flex gap-4 flex-wrap">
                  {org.appsEnabled.map((appId) => {
                    const app = APPS.find((a) => a.id === appId)
                    return (
                      <label key={appId} className="flex items-center gap-1.5 text-sm cursor-pointer">
                        <input
                          type="checkbox" name="appsAccess" value={appId} defaultChecked
                          className="w-3.5 h-3.5 rounded accent-primary"
                        />
                        <span className="flex items-center gap-1">
                          {app && <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: app.color }} />}
                          {app?.label ?? appId}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
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
