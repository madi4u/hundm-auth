import type { Metadata } from "next"
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google"
import "./globals.css"

const displayFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const sansFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "H+M Operation Cloud",
  description: "H+M Operation Cloud",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
