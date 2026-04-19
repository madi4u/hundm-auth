import Link from "next/link"
import { db } from "@/lib/db"

export default async function AdminOverviewPage() {
  const [totalUsers, activeUsers, superadmins, totalOrgs, activeOrgs, activeSessions] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isSuperadmin: true } }),
      db.organization.count(),
      db.organization.count({ where: { isActive: true } }),
      db.session.count({ where: { expiresAt: { gt: new Date() } } }),
    ])

  const stats = [
    {
      label: "Nutzer gesamt",
      value: totalUsers,
      sub: `${activeUsers} aktiv · ${totalUsers - activeUsers} deaktiviert`,
      href: "/admin/users",
    },
    {
      label: "Superadmins",
      value: superadmins,
      sub: "Mit Vollzugriff",
      href: "/admin/users",
    },
    {
      label: "Organisationen",
      value: totalOrgs,
      sub: `${activeOrgs} aktiv`,
      href: "/admin/orgs",
    },
    {
      label: "Aktive Sessions",
      value: activeSessions,
      sub: "Nicht abgelaufen",
      href: undefined,
    },
  ]

  const quickActions = [
    {
      href: "/admin/users/new",
      title: "Nutzer anlegen",
      description: "Neuen Benutzer erstellen",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      href: "/admin/orgs/new",
      title: "Organisation anlegen",
      description: "Neuen Mandanten erstellen",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight font-display">Übersicht</h1>
        <p className="text-muted-foreground text-sm mt-1">H+M Operation Cloud — Admin Panel</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-2">
              {s.label}
            </div>
            <div className="text-3xl font-bold text-foreground tabular-nums">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
            {s.href && (
              <Link href={s.href} className="text-xs text-primary hover:underline mt-3 inline-block">
                Anzeigen →
              </Link>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-foreground mb-3">Schnellzugriff</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {a.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {a.title}
              </div>
              <div className="text-xs text-muted-foreground">{a.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
