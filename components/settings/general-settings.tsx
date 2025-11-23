"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Project Name</h3>
        <p className="text-sm text-muted-foreground mb-4">Used to identify your project across MAIA</p>
        <input
          type="text"
          placeholder="MAIA Analytics"
          className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary mb-4"
        />
        <Button className="bg-red-600 hover:bg-red-700 text-white">Save Changes</Button>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Sources</h3>
        <p className="text-sm text-muted-foreground mb-4">Configure your data source integrations</p>
        <div className="space-y-3">
          {["Twitter API", "Facebook API", "Instagram API"].map((source) => (
            <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm text-foreground">{source}</span>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Irreversible and destructive actions</p>
        <Button variant="destructive">Delete Project</Button>
      </Card>
    </div>
  )
}
