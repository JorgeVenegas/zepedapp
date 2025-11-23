"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Sidebar } from "./sidebar"

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/80">
      <div className="relative z-50">
        <Sidebar expanded={false} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
