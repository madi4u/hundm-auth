"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const params = useSearchParams()
  const errorParam = params.get("error")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error ?? "Unbekannter Fehler")
      }
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-semibold mb-2">Link gesendet!</h2>
        <p className="text-gray-500 text-sm">
          Prüfe deine E-Mails. Der Link ist 15 Minuten gültig.
        </p>
        <button
          onClick={() => { setSent(false); setEmail("") }}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 underline"
        >
          Andere Email verwenden
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || errorParam) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error || (errorParam === "invalid_token" ? "Link ungültig oder abgelaufen." : "Fehler beim Login.")}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deine@email.de"
          required
          autoFocus
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Wird gesendet…" : "Magic Link senden"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Du erhältst einen Einmal-Link per E-Mail. Kein Passwort nötig.
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">H+M Cloud</h1>
          <p className="text-gray-500 mt-1 text-sm">Bitte einloggen</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
