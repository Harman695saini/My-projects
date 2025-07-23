"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Droplets, Zap, TreePine } from "lucide-react"

interface SystemPanelProps {
  mainConnections: any
  onConnectionsUpdate: (connections: any) => void
}

export default function SystemPanel({ mainConnections }: SystemPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Main Connections</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Water Source</span>
          </div>
          <Badge variant={mainConnections.waterSource ? "default" : "secondary"}>
            {mainConnections.waterSource ? "Set" : "Not Set"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-green-600" />
            <span className="text-sm">Main Drain</span>
          </div>
          <Badge variant={mainConnections.mainDrain ? "default" : "secondary"}>
            {mainConnections.mainDrain ? "Set" : "Not Set"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-800" />
            <span className="text-sm">Sewer Connection</span>
          </div>
          <Badge variant={mainConnections.sewerConnection ? "default" : "secondary"}>
            {mainConnections.sewerConnection ? "Set" : "Not Set"}
          </Badge>
        </div>

        <div className="mt-4 p-2 bg-yellow-50 rounded text-xs">
          <strong>Setup Instructions:</strong>
          <div className="mt-1 space-y-1">
            <div>1. Click: Place Water Source</div>
            <div>2. Ctrl+Click: Place Main Drain</div>
            <div>3. Shift+Click: Place Sewer Connection</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
