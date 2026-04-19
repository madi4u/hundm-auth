import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { sendMagicLink } from "@/lib/email"

const ALLOWED_DOMAINS = (process.env.ALLOWED_EMAIL_DOMAINS ?? "").split(",").map(d => d.trim())
const MAGIC_LINK_TTL_MINUTES = 15

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email erforderlich" }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()
    const domain = normalized.split("@")[1]

    if (ALLOWED_DOMAINS.length > 0 && !ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json(
        { error: "Diese Email-Domain ist nicht berechtigt." },
        { status: 403 }
      )
    }

    const user = await db.user.findUnique({ where: { email: normalized } })

    if (!user) {
      // Silent fail — don't reveal whether email exists
      return NextResponse.json({ success: true })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account ist deaktiviert." }, { status: 403 })
    }

    // Invalidate existing tokens for this user
    await db.magicLinkToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000)

    await db.magicLinkToken.create({
      data: {
        userId: user.id,
        email: normalized,
        tokenHash,
        expiresAt,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"
    const link = `${baseUrl}/api/auth/verify?token=${rawToken}`

    await sendMagicLink({ to: normalized, link, name: user.name })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[send-link] error:", err)
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 })
  }
}
