"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MousePointer, Droplets, Flame, TreePine, Zap, Wind, Circle, Square } from "lucide-react"

interface ToolPanelProps {
  currentTool: string
  onToolChange: (tool: string) => void
}

export default function ToolPanel({ currentTool, onToolChange }: ToolPanelProps) {
  const tools = [
    {
      id: "select",
      name: "Select",
      icon: MousePointer,
      color: "bg-gray-500",
      description: "Select and move elements",
    },
    {
      id: "water-supply",
      name: "Water Supply",
      icon: Droplets,
      color: "bg-blue-600",
      description: "Cold water supply lines",
    },
    {
      id: "hot-water",
      name: "Hot Water",
      icon: Flame,
      color: "bg-red-600",
      description: "Hot water supply lines",
    },
    {
      id: "drainage",
      name: "Drainage",
      icon: TreePine,
      color: "bg-green-600",
      description: "Waste water drainage",
    },
    {
      id: "soil-pipe",
      name: "Soil Pipe",
      icon: Zap,
      color: "bg-gray-800",
      description: "Main soil/sewer pipe",
    },
    {
      id: "vent",
      name: "Vent Stack",
      icon: Wind,
      color: "bg-purple-600",
      description: "Ventilation pipes",
    },
    {
      id: "fixture",
      name: "Fixture",
      icon: Circle,
      color: "bg-cyan-600",
      description: "Plumbing fixtures",
    },
    {
      id: "connection",
      name: "Connection",
      icon: Square,
      color: "bg-orange-600",
      description: "Pipe connections",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drawing Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon
          const isActive = currentTool === tool.id

          return (
            <Button
              key={tool.id}
              variant={isActive ? "default" : "outline"}
              className={`w-full justify-start gap-2 ${isActive ? "" : "hover:bg-gray-50"}`}
              onClick={() => onToolChange(tool.id)}
            >
              <div className={`w-3 h-3 rounded-full ${tool.color}`} />
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tool.name}</span>
            </Button>
          )
        })}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Current Tool:</h4>
          <Badge variant="secondary" className="mb-2">
            {tools.find((t) => t.id === currentTool)?.name || "Select"}
          </Badge>
          <p className="text-xs text-gray-600">
            {tools.find((t) => t.id === currentTool)?.description || "Select and move elements"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
