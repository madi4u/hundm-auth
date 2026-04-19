import Link from "next/link"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"

const APPS = [
  { id: "fleethub", label: "FleetHub",      color: "#FF9F1C" },
  { id: "eventhub", label: "EventHub",      color: "#FF4785" },
  { id: "gastnote", label: "GastNote",      color: "#0DBFA8" },
  { id: "cfo",      label: "CFO Dashboard", color: "#5B5FE8" },
]

async function createOrg(formData: FormData) {
  "use server"
  const name        = (formData.get("name") as string).trim()
  const displayName = (formData.get("displayName") as string).trim()
  const slug        = (formData.get("slug") as string).trim().toLowerCase().replace(/\s+/g, "-")
  const plan        = (formData.get("plan") as string) || "trial"
  const appsEnabled = formData.getAll("appsEnabled") as string[]

  const existing = await db.organization.findUnique({ where: { slug } })
  if (existing) redirect("/admin/orgs/new?error=slug_exists")

  await db.organization.create({
    data: {
      id: crypto.randomUUID(),
      name,
      displayName,
      slug,
      plan,
      appsEnabled,
    },
  })
  redirect("/admin/orgs")
}

export default function NewOrgPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/orgs"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
        >
          ← Zurück zu Organisationen
        </Link>
        <h1 className="text-2xl font-bold tracking-tight font-display mt-2">Organisation anlegen</h1>
      </div>

      {searchParams.error === "slug_exists" && (
        <div className="mb-5 max-w-lg px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Dieser Slug ist bereits vergeben.
        </div>
      )}

      <form action={createOrg} className="space-y-5 bg-card border border-border rounded-lg p-6 max-w-lg">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
            Anzeigename <span className="text-destructive">*</span>
          </label>
          <input
            id="displayName" name="displayName" type="text" required autoFocus
            placeholder="H+M Max-Planckstr GmbH"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">Wird dem Nutzer angezeigt</p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            Interner Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name" name="name" type="text" required
            placeholder="hundm_maxplanck"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
            Slug <span className="text-destructive">*</span>
          </label>
          <input
            id="slug" name="slug" type="text" required
            placeholder="hundm-maxplanck"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground mt-1">Kleinbuchstaben und Bindestriche · muss eindeutig sein</p>
        </div>

        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-foreground mb-1.5">Plan</label>
          <select
            id="plan" name="plan"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Apps aktivieren</p>
          <div className="grid grid-cols-2 gap-2">
            {APPS.map((app) => (
              <label
                key={app.id}
                className="flex items-center gap-2.5 px-3 py-2.5 border border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <input
                  type="checkbox" name="appsEnabled" value={app.id}
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

        <div className="flex gap-3 pt-2 border-t border-border">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-brand-operatorDeep transition-colors"
          >
            Organisation anlegen
          </button>
          <Link
            href="/admin/orgs"
            className="px-4 py-2 border border-border text-foreground rounded-md text-sm hover:bg-muted transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  )
}
