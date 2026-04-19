import Link from "next/link"
import { db } from "@/lib/db"

export default async function OrgsPage() {
  const orgs = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { memberships: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Organisationen</h1>
          <p className="text-muted-foreground text-sm mt-1">{orgs.length} Organisationen insgesamt</p>
        </div>
        <Link
          href="/admin/orgs/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-brand-operatorDeep transition-colors"
        >
          + Organisation anlegen
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Apps</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Mitglieder</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr
                key={org.id}
                className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{org.displayName}</div>
                  <div className="text-xs text-muted-foreground">{org.name}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{org.slug}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border capitalize">
                    {org.plan}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {org.appsEnabled.length === 0 ? (
                      <span className="text-xs text-muted-foreground">–</span>
                    ) : (
                      org.appsEnabled.map((a) => (
                        <span key={a} className="px-1.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded">
                          {a}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">{org._count.memberships}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      org.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {org.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orgs/${org.id}`} className="text-xs text-primary hover:underline">
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  Noch keine Organisationen vorhanden.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
