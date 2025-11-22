"use client"

import { SettingsSidebar } from "@/components/settings/settings-sidebar"
import { GeneralSettings } from "@/components/settings/general-settings"

export function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your MAIA configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsSidebar />
        <div className="lg:col-span-3">
          <GeneralSettings />
        </div>
      </div>
    </div>
  )
}
