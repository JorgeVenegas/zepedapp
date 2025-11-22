"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { AlertCircle, LayoutGrid, Database, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/records", label: "Records", icon: Database },
    { href: "/patterns", label: "Patterns", icon: Settings },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-red-100 flex flex-col">
      <div className="p-6 border-b border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-bold text-gray-900">MAIA</h1>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 px-6 pt-2">Mobility AI Insights</p>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                isActive ? "bg-red-50 text-red-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-red-100">
        <div className="p-3 rounded-lg bg-red-50">
          <p className="text-xs text-red-600 font-medium">Ready to connect with Supabase</p>
        </div>
      </div>
    </aside>
  )
}
