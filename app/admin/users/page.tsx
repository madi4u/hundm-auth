import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  })

  async function toggleActive(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const current = formData.get("isActive") === "true"
    await db.user.update({ where: { id }, data: { isActive: !current } })
    redirect("/admin/users")
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Nutzer</h1>
          <p className="text-muted-foreground text-sm mt-1">{users.length} Benutzer insgesamt</p>
        </div>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-brand-operatorDeep transition-colors"
        >
          + Nutzer anlegen
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">E-Mail</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Orgs</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Erstellt</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{user.name}</span>
                    {user.isSuperadmin && (
                      <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded font-medium">
                        Superadmin
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{user.email}</td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{user._count.memberships}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {user.isActive ? "Aktiv" : "Deaktiviert"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs tabular-nums">
                  {user.createdAt.toLocaleDateString("de-DE")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 justify-end">
                    <Link href={`/admin/users/${user.id}`} className="text-xs text-primary hover:underline">
                      Bearbeiten
                    </Link>
                    <form action={toggleActive}>
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="isActive" value={String(user.isActive)} />
                      <button
                        type="submit"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {user.isActive ? "Deaktivieren" : "Aktivieren"}
                      </button>
                    </form>
                    <Link
                      href={`/admin/users/${user.id}?confirm=delete`}
                      className="text-xs text-destructive hover:underline"
                    >
                      Löschen
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  Noch keine Nutzer vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
