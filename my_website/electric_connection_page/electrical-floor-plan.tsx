"use client"

import { useState } from "react"
import { Power, Lightbulb, Fan, Tv, Zap, Settings } from "lucide-react"

export default function ElectricalFloorPlan() {
  const [showWiring, setShowWiring] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  // Room definitions
  const rooms = [
    { id: "living", name: "Living Room", x: 50, y: 50, width: 300, height: 200, color: "#f0f9ff" },
    { id: "kitchen", name: "Kitchen", x: 350, y: 50, width: 200, height: 150, color: "#fef3c7" },
    { id: "bedroom1", name: "Master Bedroom", x: 50, y: 250, width: 250, height: 200, color: "#f0fdf4" },
    { id: "bedroom2", name: "Bedroom 2", x: 300, y: 250, width: 200, height: 150, color: "#fdf2f8" },
    { id: "bathroom1", name: "Bathroom 1", x: 500, y: 250, width: 100, height: 100, color: "#f0f4ff" },
    { id: "bathroom2", name: "Bathroom 2", x: 300, y: 400, width: 100, height: 50, color: "#f0f4ff" },
    { id: "utility", name: "Utility", x: 550, y: 50, width: 100, height: 100, color: "#f5f5f5" },
    { id: "entrance", name: "Entrance", x: 400, y: 400, width: 150, height: 50, color: "#fafafa" },
  ]

  // Electrical components
  const electricalComponents = [
    // Main Distribution Board
    { id: "mdb", type: "MDB", x: 420, y: 420, room: "entrance", label: "Main Distribution Board" },

    // Switchboards
    { id: "sw1", type: "switch", x: 70, y: 70, room: "living", label: "Living Room Switch" },
    { id: "sw2", type: "switch", x: 370, y: 70, room: "kitchen", label: "Kitchen Switch" },
    { id: "sw3", type: "switch", x: 70, y: 270, room: "bedroom1", label: "Master BR Switch" },
    { id: "sw4", type: "switch", x: 320, y: 270, room: "bedroom2", label: "Bedroom 2 Switch" },
    { id: "sw5", type: "switch", x: 520, y: 270, room: "bathroom1", label: "Bath 1 Switch" },
    { id: "sw6", type: "switch", x: 320, y: 420, room: "bathroom2", label: "Bath 2 Switch" },
    { id: "sw7", type: "switch", x: 570, y: 70, room: "utility", label: "Utility Switch" },

    // Light Points
    { id: "l1", type: "light", x: 200, y: 150, room: "living", label: "Living Light" },
    { id: "l2", type: "light", x: 450, y: 125, room: "kitchen", label: "Kitchen Light" },
    { id: "l3", type: "light", x: 175, y: 350, room: "bedroom1", label: "Master BR Light" },
    { id: "l4", type: "light", x: 400, y: 325, room: "bedroom2", label: "Bedroom 2 Light" },
    { id: "l5", type: "light", x: 550, y: 300, room: "bathroom1", label: "Bath 1 Light" },
    { id: "l6", type: "light", x: 350, y: 425, room: "bathroom2", label: "Bath 2 Light" },
    { id: "l7", type: "light", x: 600, y: 100, room: "utility", label: "Utility Light" },

    // Fan Points
    { id: "f1", type: "fan", x: 200, y: 120, room: "living", label: "Living Fan" },
    { id: "f2", type: "fan", x: 175, y: 320, room: "bedroom1", label: "Master BR Fan" },
    { id: "f3", type: "fan", x: 400, y: 295, room: "bedroom2", label: "Bedroom 2 Fan" },

    // 5A Sockets
    { id: "s1", type: "socket5A", x: 320, y: 100, room: "living", label: "5A Socket" },
    { id: "s2", type: "socket5A", x: 280, y: 300, room: "bedroom1", label: "5A Socket" },
    { id: "s3", type: "socket5A", x: 480, y: 300, room: "bedroom2", label: "5A Socket" },

    // 15A Sockets (Kitchen)
    { id: "s4", type: "socket15A", x: 380, y: 180, room: "kitchen", label: "15A Socket" },
    { id: "s5", type: "socket15A", x: 520, y: 120, room: "kitchen", label: "15A Socket" },

    // AC Points
    { id: "ac1", type: "ac", x: 300, y: 80, room: "living", label: "AC Point" },
    { id: "ac2", type: "ac", x: 250, y: 280, room: "bedroom1", label: "AC Point" },
    { id: "ac3", type: "ac", x: 450, y: 280, room: "bedroom2", label: "AC Point" },

    // Geyser Points
    { id: "g1", type: "geyser", x: 580, y: 320, room: "bathroom1", label: "Geyser" },
    { id: "g2", type: "geyser", x: 380, y: 440, room: "bathroom2", label: "Geyser" },

    // Washing Machine Point
    { id: "wm1", type: "washing", x: 580, y: 130, room: "utility", label: "Washing Machine" },

    // TV Point
    { id: "tv1", type: "tv", x: 120, y: 200, room: "living", label: "TV Point" },
  ]

  // Wire connections from MDB to all components
  const wireConnections = [
    // From MDB to switches
    { from: "mdb", to: "sw1", path: "M420,420 L420,380 L200,380 L200,200 L70,200 L70,70" },
    { from: "mdb", to: "sw2", path: "M420,420 L420,380 L370,380 L370,70" },
    { from: "mdb", to: "sw3", path: "M420,420 L420,380 L200,380 L200,270 L70,270" },
    { from: "mdb", to: "sw4", path: "M420,420 L420,380 L320,380 L320,270" },
    { from: "mdb", to: "sw5", path: "M420,420 L520,420 L520,270" },
    { from: "mdb", to: "sw6", path: "M420,420 L320,420" },
    { from: "mdb", to: "sw7", path: "M420,420 L420,380 L570,380 L570,70" },

    // From switches to lights and fans
    { from: "sw1", to: "l1", path: "M70,70 L70,50 L200,50 L200,150" },
    { from: "sw1", to: "f1", path: "M70,70 L70,40 L200,40 L200,120" },
    { from: "sw2", to: "l2", path: "M370,70 L370,30 L450,30 L450,125" },
    { from: "sw3", to: "l3", path: "M70,270 L70,250 L175,250 L175,350" },
    { from: "sw3", to: "f2", path: "M70,270 L70,240 L175,240 L175,320" },
    { from: "sw4", to: "l4", path: "M320,270 L320,230 L400,230 L400,325" },
    { from: "sw4", to: "f3", path: "M320,270 L320,220 L400,220 L400,295" },
    { from: "sw5", to: "l5", path: "M520,270 L550,270 L550,300" },
    { from: "sw6", to: "l6", path: "M320,420 L350,420 L350,425" },
    { from: "sw7", to: "l7", path: "M570,70 L570,100 L600,100" },

    // Direct connections for sockets and appliances
    { from: "mdb", to: "s1", path: "M420,420 L420,380 L320,380 L320,100" },
    { from: "mdb", to: "s2", path: "M420,420 L420,380 L280,380 L280,300" },
    { from: "mdb", to: "s3", path: "M420,420 L420,380 L480,380 L480,300" },
    { from: "mdb", to: "s4", path: "M420,420 L420,380 L380,380 L380,180" },
    { from: "mdb", to: "s5", path: "M420,420 L420,380 L520,380 L520,120" },
    { from: "mdb", to: "ac1", path: "M420,420 L420,380 L300,380 L300,80" },
    { from: "mdb", to: "ac2", path: "M420,420 L420,380 L250,380 L250,280" },
    { from: "mdb", to: "ac3", path: "M420,420 L420,380 L450,380 L450,280" },
    { from: "mdb", to: "g1", path: "M420,420 L520,420 L520,380 L580,380 L580,320" },
    { from: "mdb", to: "g2", path: "M420,420 L380,420 L380,440" },
    { from: "mdb", to: "wm1", path: "M420,420 L420,380 L580,380 L580,130" },
    { from: "mdb", to: "tv1", path: "M420,420 L420,380 L120,380 L120,200" },
  ]

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
      default:
        return null
    }
  }

  const getComponentColor = (type: string) => {
    switch (type) {
      case "MDB":
        return "#dc2626"
      case "switch":
        return "#059669"
      case "light":
        return "#f59e0b"
      case "fan":
        return "#3b82f6"
      case "socket5A":
        return "#8b5cf6"
      case "socket15A":
        return "#dc2626"
      case "ac":
        return "#06b6d4"
      case "geyser":
        return "#ef4444"
      case "washing":
        return "#6b7280"
      case "tv":
        return "#1f2937"
      default:
        return "#000000"
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Residential Electrical Floor Plan</h1>
        <p className="text-gray-600 mb-4">Complete electrical wiring layout with optimized wire routing</p>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowWiring(!showWiring)}
            className={`px-4 py-2 rounded-lg font-medium ${
              showWiring ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
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
        </div>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <svg width="700" height="500" viewBox="0 0 700 500" className="w-full h-auto">
          {/* Room backgrounds */}
          {rooms.map((room) => (
            <g key={room.id}>
              <rect
                x={room.x}
                y={room.y}
                width={room.width}
                height={room.height}
                fill={room.color}
                stroke="#374151"
                strokeWidth="2"
              />
              {showLabels && (
                <text
                  x={room.x + room.width / 2}
                  y={room.y + 20}
                  textAnchor="middle"
                  className="text-sm font-semibold fill-gray-700"
                >
                  {room.name}
                </text>
              )}
            </g>
          ))}

          {/* Wiring paths */}
          {showWiring &&
            wireConnections.map((wire, index) => (
              <path
                key={index}
                d={wire.path}
                stroke="#dc2626"
                strokeWidth="2"
                fill="none"
                strokeDasharray="none"
                opacity="0.8"
              />
            ))}

          {/* Electrical components */}
          {electricalComponents.map((component) => (
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
                  {component.label}
                </text>
              )}
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(20, 460)">
            <rect x="0" y="0" width="660" height="35" fill="white" stroke="#d1d5db" strokeWidth="1" rx="4" />
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

            <circle cx="380" cy="10" r="3" fill="#06b6d4" />
            <text x="388" y="14" className="text-xs fill-gray-600">
              AC
            </text>

            <circle cx="420" cy="10" r="3" fill="#ef4444" />
            <text x="428" y="14" className="text-xs fill-gray-600">
              Geyser
            </text>

            <circle cx="470" cy="10" r="3" fill="#6b7280" />
            <text x="478" y="14" className="text-xs fill-gray-600">
              Washing M.
            </text>

            <circle cx="540" cy="10" r="3" fill="#1f2937" />
            <text x="548" y="14" className="text-xs fill-gray-600">
              TV Point
            </text>

            <line x1="590" y1="6" x2="610" y2="14" stroke="#dc2626" strokeWidth="2" />
            <text x="615" y="14" className="text-xs fill-gray-600">
              Wiring
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Power Distribution</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Main Distribution Board at entrance</li>
            <li>• Individual switches per room</li>
            <li>• Optimized wire routing along walls</li>
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">Lighting & Fans</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Ceiling lights in all rooms</li>
            <li>• Fans in bedrooms and living room</li>
            <li>• Individual switch control</li>
          </ul>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-2">Power Outlets</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• 15A sockets for kitchen appliances</li>
            <li>• 5A sockets in living/bedrooms</li>
            <li>• Dedicated AC and appliance points</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
