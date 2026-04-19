"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Übersicht",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Nutzer",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/admin/orgs",
    label: "Organisationen",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

export default function AdminNav({ currentUser }: { currentUser: { name: string; email: string } }) {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#0B0D12] flex flex-col h-full shrink-0 border-r border-white/[0.06]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1E5AFF] rounded-md flex items-center justify-center shrink-0">
            <svg viewBox="0 0 60 60" className="w-4 h-4">
              <g fill="white">
                <rect x="24" y="8"  width="12" height="16" />
                <rect x="24" y="36" width="12" height="16" />
                <rect x="8"  y="24" width="16" height="12" />
                <rect x="36" y="24" width="16" height="12" />
              </g>
              <rect x="24" y="24" width="12" height="12" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-[#F6F7FA] text-sm font-semibold leading-tight tracking-tight">
              H<span className="text-[#1E5AFF]">+</span>M Cloud
            </div>
            <div className="text-[#6B7280] text-[11px] mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[#1E5AFF] text-white"
                  : "text-[#6B7280] hover:text-[#F6F7FA] hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="text-xs text-[#F6F7FA] font-medium truncate">{currentUser.name}</div>
        <div className="text-[11px] text-[#6B7280] truncate mt-0.5">{currentUser.email}</div>
        <Link
          href="/api/auth/logout"
          className="text-[11px] text-[#6B7280] hover:text-[#F6F7FA] mt-2 inline-block transition-colors"
        >
          Abmelden
        </Link>
      </div>
    </aside>
  )
}
