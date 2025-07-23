"use client"

import { useState } from "react"
import type { ElectricalComponent, WireConnection, FloorPlan } from "../types/electrical-types"
import { defaultElectricalRules } from "../utils/electrical-rules"
import { ComponentPlacer } from "../utils/component-placement"
import { WireRouter } from "../utils/wire-router"
import { Power, Lightbulb, Fan, Tv, Zap, Settings } from "lucide-react"

interface ElectricalGeneratorProps {
  floorPlan: FloorPlan
  onGenerate?: (components: ElectricalComponent[], connections: WireConnection[]) => void
}

export function ElectricalGenerator({ floorPlan, onGenerate }: ElectricalGeneratorProps) {
  const [components, setComponents] = useState<ElectricalComponent[]>([])
  const [connections, setConnections] = useState<WireConnection[]>([])
  const [showWiring, setShowWiring] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [isGenerated, setIsGenerated] = useState(false)

  const generateElectricalLayout = () => {
    const placer = new ComponentPlacer()
    const generatedComponents = placer.placeComponents(floorPlan.rooms, defaultElectricalRules)

    const router = new WireRouter(floorPlan.rooms, generatedComponents)
    const generatedConnections = router.generateConnections()

    setComponents(generatedComponents)
    setConnections(generatedConnections)
    setIsGenerated(true)

    if (onGenerate) {
      onGenerate(generatedComponents, generatedConnections)
    }
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case "MDB":
        return <Settings className="w-4 h-4" />
      case "switch":
        return <Power className="w-3 h-3" />
      case "light":
        return <Lightbulb className="w-3 h-3" />
      case "fan":
        return <Fan className="w-3 h-3" />
      case "socket5A":
        return <Zap className="w-3 h-3" />
      case "socket15A":
        return <Zap className="w-4 h-4" />
      case "ac":
        return <div className="w-4 h-2 bg-blue-500 rounded"></div>
      case "geyser":
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      case "washing":
        return <div className="w-4 h-4 bg-gray-500 rounded"></div>
      case "tv":
        return <Tv className="w-3 h-3" />
      case "exhaust":
        return <div className="w-3 h-3 bg-green-500 rounded"></div>
      default:
        return null
    }
  }

  const getComponentColor = (type: string) => {
    const colors = {
      MDB: "#dc2626",
      switch: "#059669",
      light: "#f59e0b",
      fan: "#3b82f6",
      socket5A: "#8b5cf6",
      socket15A: "#dc2626",
      ac: "#06b6d4",
      geyser: "#ef4444",
      washing: "#6b7280",
      tv: "#1f2937",
      exhaust: "#10b981",
    }
    return colors[type as keyof typeof colors] || "#000000"
  }

  const calculateStats = () => {
    const stats = {
      totalComponents: components.length,
      totalConnections: connections.length,
      totalLoad: components.reduce((sum, c) => sum + (c.amperage || 0), 0),
      roomsCovered: new Set(components.map((c) => c.roomId)).size,
    }
    return stats
  }

  const stats = calculateStats()

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Automatic Electrical Layout Generator</h1>
        <p className="text-gray-600 mb-4">
          Intelligent electrical wiring system with automatic component placement and wire routing
        </p>

        <div className="flex gap-4 mb-4">
          <button
            onClick={generateElectricalLayout}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            {isGenerated ? "Regenerate Layout" : "Generate Electrical Layout"}
          </button>

          {isGenerated && (
            <>
              <button
                onClick={() => setShowWiring(!showWiring)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  showWiring ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {showWiring ? "Hide" : "Show"} Wiring
              </button>
              <button
                onClick={() => setShowLabels(!showLabels)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  showLabels ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {showLabels ? "Hide" : "Show"} Labels
              </button>
            </>
          )}
        </div>

        {isGenerated && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalComponents}</div>
              <div className="text-sm text-blue-800">Components</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalConnections}</div>
              <div className="text-sm text-green-800">Connections</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.totalLoad}A</div>
              <div className="text-sm text-yellow-800">Total Load</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.roomsCovered}</div>
              <div className="text-sm text-purple-800">Rooms Covered</div>
            </div>
          </div>
        )}
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-auto bg-gray-50">
          {/* Room backgrounds */}
          {floorPlan.rooms.map((room) => (
            <g key={room.id}>
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={room.color || "#f9fafb"}
                stroke="#374151"
                strokeWidth="2"
              />
              <text
                x={room.x + room.width / 2}
                y={room.y + 20}
                textAnchor="middle"
                className="text-sm font-semibold fill-gray-700"
              >
                {room.name}
              </text>
            </g>
          ))}

          {/* Wiring paths */}
          {showWiring &&
            isGenerated &&
            connections.map((connection) => (
              <path
                key={connection.id}
                d={connection.path}
                stroke={connection.type === "power" ? "#dc2626" : "#f59e0b"}
                strokeWidth={connection.amperage > 10 ? "3" : "2"}
                fill="none"
                opacity="0.8"
                strokeDasharray={connection.type === "control" ? "5,5" : "none"}
              />
            ))}

          {/* Electrical components */}
          {isGenerated &&
            components.map((component) => (
              <g key={component.id}>
                <circle
                  cx={component.x}
                  cy={component.y}
                  r={component.type === "MDB" ? 8 : component.type === "socket15A" ? 6 : 5}
                  fill={getComponentColor(component.type)}
                  stroke="white"
                  strokeWidth="2"
                />
                <foreignObject
                  x={component.x - 8}
                  y={component.y - 8}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <div className="flex items-center justify-center w-full h-full text-white">
                    {getComponentIcon(component.type)}
                  </div>
                </foreignObject>
                {showLabels && (
                  <text x={component.x} y={component.y + 20} textAnchor="middle" className="text-xs fill-gray-600">
                    {component.type}
                    {component.amperage && ` (${component.amperage}A)`}
                  </text>
                )}
              </g>
            ))}

          {/* Legend */}
          <g transform="translate(20, 550)">
            <rect x="0" y="0" width="760" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" rx="4" />
            <text x="10" y="15" className="text-sm font-semibold fill-gray-700">
              Legend:
            </text>

            <circle cx="70" cy="10" r="4" fill="#dc2626" />
            <text x="80" y="14" className="text-xs fill-gray-600">
              MDB
            </text>

            <circle cx="120" cy="10" r="3" fill="#059669" />
            <text x="128" y="14" className="text-xs fill-gray-600">
              Switch
            </text>

            <circle cx="170" cy="10" r="3" fill="#f59e0b" />
            <text x="178" y="14" className="text-xs fill-gray-600">
              Light
            </text>

            <circle cx="210" cy="10" r="3" fill="#3b82f6" />
            <text x="218" y="14" className="text-xs fill-gray-600">
              Fan
            </text>

            <circle cx="250" cy="10" r="3" fill="#8b5cf6" />
            <text x="258" y="14" className="text-xs fill-gray-600">
              5A Socket
            </text>

            <circle cx="310" cy="10" r="4" fill="#dc2626" />
            <text x="320" y="14" className="text-xs fill-gray-600">
              15A Socket
            </text>

            <line x1="380" y1="6" x2="400" y2="14" stroke="#dc2626" strokeWidth="3" />
            <text x="405" y="14" className="text-xs fill-gray-600">
              Power (Red)
            </text>

            <line x1="470" y1="6" x2="490" y2="14" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
            <text x="495" y="14" className="text-xs fill-gray-600">
              Control (Yellow)
            </text>
          </g>
        </svg>
      </div>
    </div>
  )
}
