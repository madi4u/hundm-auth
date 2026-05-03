import { redirect } from "next/navigation"
import { getSessionFromCookie } from "@/lib/session"

export default async function Home() {
  const session = await getSessionFromCookie()
  if (session) {
    redirect("/admin")
  }
  redirect("/login")
}
