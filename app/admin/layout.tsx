import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSessionFromCookie } from "@/lib/session"
import AdminNav from "./admin-nav"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Admin Panel — H+M Operation Cloud",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionFromCookie()

  if (!session) redirect("/login")
  if (!session.isSuperadmin) redirect("/login?error=forbidden")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminNav currentUser={{ name: session.name, email: session.email }} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
