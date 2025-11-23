"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/80">
      <div
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
        className="relative z-50"
      >
        <Sidebar expanded={sidebarExpanded} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
