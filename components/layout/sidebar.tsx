"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AlertCircle, LayoutGrid, Database, Settings } from "lucide-react"

interface SidebarProps {
  expanded?: boolean
}

export function Sidebar({ expanded = false }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/records", label: "Records", icon: Database },
    { href: "/patterns", label: "Patterns", icon: Settings },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "bg-gradient-to-b from-white via-slate-50/90 to-slate-100/70 border-r-2 border-slate-200/60 flex flex-col transition-all duration-300 ease-in-out h-full shadow-2xl shadow-slate-200/20 backdrop-blur-sm",
        expanded ? "w-64" : "w-16"
      )}
    >
      <div className="p-4 border-b-2 border-slate-200/60 flex items-center justify-center bg-gradient-to-r from-blue-50/60 to-indigo-50/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 drop-shadow-sm" />
          <h1
            className={cn(
              "text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300",
              expanded ? "opacity-100 w-auto" : "opacity-0 w-0"
            )}
          >
            MAIA
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-2 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-sm",
                isActive ? "bg-gradient-to-r from-blue-100/80 to-indigo-100/60 text-blue-700 font-semibold border-2 border-blue-200/60 shadow-blue-200/20" : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-200/60 hover:text-slate-800 hover:border-2 hover:border-slate-200/60",
                expanded ? "pl-3 pr-3 justify-start" : "pl-3 pr-3 justify-start"
              )}
              title={!expanded ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={cn(
                  "text-sm transition-all duration-300 whitespace-nowrap",
                  expanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
