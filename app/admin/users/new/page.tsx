import Link from "next/link"
import { redirect } from "next/navigation"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendWelcomeLink } from "@/lib/email"

async function createUser(formData: FormData) {
  "use server"
  const name = (formData.get("name") as string).trim()
  const email = (formData.get("email") as string).trim().toLowerCase()
  const isSuperadmin = formData.get("isSuperadmin") === "on"
  const sendWelcome = formData.get("sendWelcome") === "on"

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) redirect("/admin/users/new?error=exists")

  const user = await db.user.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email,
      isSuperadmin,
    },
  })

  if (sendWelcome) {
    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.magicLinkToken.create({
      data: {
        userId: user.id,
        email,
        tokenHash,
        expiresAt,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"
    const link = `${baseUrl}/api/auth/verify?token=${rawToken}`
    await sendWelcomeLink({ to: email, link, name })
  }

  redirect("/admin/users?created=1")
}

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-4"
        >
          ← Zurück zu Nutzern
        </Link>
        <h1 className="text-2xl font-bold tracking-tight font-display mt-2">Nutzer anlegen</h1>
      </div>

      {error === "exists" && (
        <div className="mb-5 max-w-lg px-4 py-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Diese E-Mail-Adresse ist bereits registriert.
        </div>
      )}

      <form action={createUser} className="space-y-5 bg-card border border-border rounded-lg p-6 max-w-lg">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoFocus
            placeholder="Max Mustermann"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            E-Mail-Adresse <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="max@example.de"
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-start gap-3 pt-1">
          <input
            id="isSuperadmin"
            name="isSuperadmin"
            type="checkbox"
            className="w-4 h-4 mt-0.5 rounded border-input accent-primary"
          />
          <div>
            <label htmlFor="isSuperadmin" className="text-sm font-medium text-foreground cursor-pointer">
              Superadmin
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Vollzugriff auf Admin Panel und alle Apps
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-1 border-t border-border">
          <input
            id="sendWelcome"
            name="sendWelcome"
            type="checkbox"
            defaultChecked
            className="w-4 h-4 mt-0.5 rounded border-input accent-primary"
          />
          <div>
            <label htmlFor="sendWelcome" className="text-sm font-medium text-foreground cursor-pointer">
              Welcome-Mail senden
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sendet einen Login-Link per E-Mail (gültig 24 Stunden)
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-brand-operatorDeep transition-colors"
          >
            Nutzer anlegen
          </button>
          <Link
            href="/admin/users"
            className="px-4 py-2 border border-border text-foreground rounded-md text-sm hover:bg-muted transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  )
}
