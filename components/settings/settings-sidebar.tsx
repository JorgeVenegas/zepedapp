"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings2, Shield, DatabaseIcon, Zap, Bell } from "lucide-react"

export function SettingsSidebar() {
  const pathname = usePathname()

  const sections = [
    { id: "general", label: "General", icon: Settings2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "database", label: "Database", icon: DatabaseIcon },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "notifications", label: "Notifications", icon: Bell },
  ]

  return (
    <div className="space-y-1">
      {sections.map((section) => {
        const Icon = section.icon
        return (
          <Link
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="w-4 h-4" />
            {section.label}
          </Link>
        )
      })}
    </div>
  )
}
