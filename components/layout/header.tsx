"use client"

import { Menu, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutGrid, Database, Settings } from "lucide-react"

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutGrid },
    { href: "/records", label: "Records", icon: Database },
    { href: "/patterns", label: "Patterns", icon: "sparkles" },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <header className="h-16 bg-white border-b border-red-100 flex items-center px-6 gap-6">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="text-red-600 hover:bg-red-50">
        <Menu className="w-5 h-5" />
      </Button>

      <nav className="flex-1 flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon === "sparkles" ? null : item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium",
                isActive ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 hover:text-red-600">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-red-50 hover:text-red-600">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
