import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "H+M Cloud — Login",
  description: "H+M Operation Cloud",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
