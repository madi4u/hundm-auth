import nodemailer from "nodemailer"

const transport = nodemailer.createTransport(
  process.env.EMAIL_SERVER ?? "smtp://localhost:1025"
)

export async function sendMagicLink({
  to,
  link,
  name,
}: {
  to: string
  link: string
  name: string
}) {
  const appUrl = process.env.NEXTAUTH_URL ?? "https://auth.hundm.cloud"

  if (process.env.NODE_ENV !== "production" || !process.env.EMAIL_SERVER) {
    console.log(`\n🔑 MAGIC LINK for ${to}:\n${link}\n`)
    return
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@hundm.cloud",
    to,
    subject: "Dein Login-Link für H+M Cloud",
    text: `Hallo ${name},\n\nHier ist dein Login-Link:\n${link}\n\nDer Link ist 15 Minuten gültig.\n\nH+M Operation Cloud`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 500px; margin: 40px auto; color: #111;">
  <h2 style="margin-bottom: 8px;">Hallo ${name},</h2>
  <p style="color: #555; margin-bottom: 32px;">Klicke auf den Button um dich einzuloggen:</p>
  <a href="${link}" style="
    display: inline-block;
    background: #111;
    color: white;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
  ">Jetzt einloggen</a>
  <p style="margin-top: 32px; font-size: 13px; color: #888;">
    Der Link ist 15 Minuten gültig. Falls du diese Email nicht angefordert hast, kannst du sie ignorieren.
  </p>
  <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
  <p style="font-size: 12px; color: #aaa;">H+M Operation Cloud · ${appUrl}</p>
</body>
</html>
    `.trim(),
  })
}
