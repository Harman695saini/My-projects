"use client"

import { useState, useRef } from "react"
import type { ImageFloorPlan, ImageElectricalComponent } from "../types/image-electrical-types"
import { defaultElectricalRules } from "../utils/electrical-rules"
import { Power, Lightbulb, Fan, Tv, Zap, Settings, Download } from "lucide-react"

interface WireConnection {
  id: string
  from: string
  to: string
  path: string
  type: "power" | "control"
  amperage: number
}

interface ImageElectricalGeneratorProps {
  floorPlan: ImageFloorPlan
}

export function ImageElectricalGenerator({ floorPlan }: ImageElectricalGeneratorProps) {
  const [components, setComponents] = useState<ImageElectricalComponent[]>([])
  const [connections, setConnections] = useState<WireConnection[]>([])
  const [showWiring, setShowWiring] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateElectricalLayout = () => {
    console.log("Generating electrical layout for rooms:", floorPlan.rooms)

    const generatedComponents: ImageElectricalComponent[] = []
    let componentId = 1

    // Find entrance room for MDB placement, or use first room
    const entranceRoom = floorPlan.rooms.find((r) => r.type === "entrance") || floorPlan.rooms[0]

    if (!entranceRoom) {
      console.warn("No rooms found to generate electrical layout")
      return
    }

    // Add MDB first
    const mdbComponent: ImageElectricalComponent = {
      id: `MDB_${componentId++}`,
      type: "MDB",
      x: entranceRoom.bounds.x + 20,
      y: entranceRoom.bounds.y + entranceRoom.bounds.height - 20,
      roomId: entranceRoom.id,
      label: "Main Distribution Board",
      amperage: 100,
      priority: 0,
    }
    generatedComponents.push(mdbComponent)

    // Generate components for each room
    for (const room of floorPlan.rooms) {
      const roomRules = defaultElectricalRules[room.type]
      if (!roomRules) {
        console.log(`No rules found for room type: ${room.type}`)
        continue
      }

      console.log(`Generating components for room: ${room.name} (${room.type})`)

      const roomCenter = {
        x: room.bounds.x + room.bounds.width / 2,
        y: room.bounds.y + room.bounds.height / 2,
      }

      // Sort components by priority
      const sortedComponents = [...roomRules.components].sort((a, b) => a.priority - b.priority)

      let wallOffset = 0
      let ceilingOffset = 0

      for (const componentRule of sortedComponents) {
        // Skip MDB if we already added it
        if (componentRule.type === "MDB") continue

        for (let i = 0; i < componentRule.count; i++) {
          let position: { x: number; y: number }

          switch (componentRule.placement) {
            case "wall":
              // Place along walls with some offset
              const wallPositions = [
                { x: room.bounds.x + 25, y: room.bounds.y + 25 + wallOffset * 40 },
                { x: room.bounds.x + room.bounds.width - 25, y: room.bounds.y + 25 + wallOffset * 40 },
                { x: room.bounds.x + 25 + wallOffset * 40, y: room.bounds.y + room.bounds.height - 25 },
                { x: room.bounds.x + room.bounds.width - 25, y: room.bounds.y + room.bounds.height - 25 },
              ]
              position = wallPositions[wallOffset % wallPositions.length]
              wallOffset++
              break
            case "ceiling":
              // Place in ceiling area
              const ceilingPositions = [
                roomCenter,
                { x: roomCenter.x - 60, y: roomCenter.y - 40 },
                { x: roomCenter.x + 60, y: roomCenter.y + 40 },
              ]
              position = ceilingPositions[ceilingOffset % ceilingPositions.length]
              ceilingOffset++
              break
            case "corner":
              const corners = [
                { x: room.bounds.x + 20, y: room.bounds.y + 20 },
                { x: room.bounds.x + room.bounds.width - 20, y: room.bounds.y + 20 },
                { x: room.bounds.x + room.bounds.width - 20, y: room.bounds.y + room.bounds.height - 20 },
                { x: room.bounds.x + 20, y: room.bounds.y + room.bounds.height - 20 },
              ]
              position = corners[i % corners.length]
              break
            default:
              position = roomCenter
          }

          const component: ImageElectricalComponent = {
            id: `${componentRule.type}_${componentId++}`,
            type: componentRule.type,
            x: position.x,
            y: position.y,
            roomId: room.id,
            label: `${room.name} ${componentRule.type}`,
            amperage: componentRule.amperage,
            priority: componentRule.priority,
          }

          generatedComponents.push(component)
        }
      }
    }

    console.log("Generated components:", generatedComponents)

    // Generate connections
    const generatedConnections = generateConnections(generatedComponents)
    console.log("Generated connections:", generatedConnections)

    setComponents(generatedComponents)
    setConnections(generatedConnections)
    setIsGenerated(true)
  }

  const generateConnections = (components: ImageElectricalComponent[]): WireConnection[] => {
    const connections: WireConnection[] = []
    const mdb = components.find((c) => c.type === "MDB")

    if (!mdb) {
      console.warn("No MDB found, cannot generate connections")
      return connections
    }

    let connectionId = 1

    // Group components by room for efficient routing
    const componentsByRoom = new Map<string, ImageElectricalComponent[]>()

    for (const component of components) {
      if (component.type === "MDB") continue

      if (!componentsByRoom.has(component.roomId)) {
        componentsByRoom.set(component.roomId, [])
      }
      componentsByRoom.get(component.roomId)!.push(component)
    }

    // Create connections from MDB to each room's main switch first
    for (const [roomId, roomComponents] of componentsByRoom) {
      const switches = roomComponents.filter((c) => c.type === "switch")

      for (const switchComp of switches) {
        // Main power connection from MDB to switch
        const powerConnection: WireConnection = {
          id: `conn_${connectionId++}`,
          from: mdb.id,
          to: switchComp.id,
          path: createOptimizedPath(mdb, switchComp),
          type: "power",
          amperage: 20,
        }
        connections.push(powerConnection)

        // Connect switch to lights and fans in the same room
        const controllableComponents = roomComponents.filter(
          (c) => c.type === "light" || c.type === "fan" || c.type === "exhaust",
        )

        for (const controlled of controllableComponents) {
          const controlConnection: WireConnection = {
            id: `conn_${connectionId++}`,
            from: switchComp.id,
            to: controlled.id,
            path: createOptimizedPath(switchComp, controlled),
            type: "control",
            amperage: controlled.amperage || 5,
          }
          connections.push(controlConnection)
        }
      }

      // Direct connections from MDB for high-power appliances
      const directComponents = roomComponents.filter(
        (c) =>
          c.type === "socket15A" ||
          c.type === "ac" ||
          c.type === "geyser" ||
          c.type === "washing" ||
          c.type === "socket5A" ||
          c.type === "tv",
      )

      for (const direct of directComponents) {
        const directConnection: WireConnection = {
          id: `conn_${connectionId++}`,
          from: mdb.id,
          to: direct.id,
          path: createOptimizedPath(mdb, direct),
          type: "power",
          amperage: direct.amperage || 5,
        }
        connections.push(directConnection)
      }
    }

    return connections
  }

  const createOptimizedPath = (from: ImageElectricalComponent, to: ImageElectricalComponent): string => {
    // Create a path that follows walls and avoids crossing rooms when possible
    const startX = from.x
    const startY = from.y
    const endX = to.x
    const endY = to.y

    // Simple L-shaped path for now
    if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
      // Horizontal first, then vertical
      return `M${startX},${startY} L${endX},${startY} L${endX},${endY}`
    } else {
      // Vertical first, then horizontal
      return `M${startX},${startY} L${startX},${endY} L${endX},${endY}`
    }
  }

  const downloadElectricalLayout = async () => {
    if (!isGenerated || !floorPlan.imageUrl) return

    setIsDownloading(true)

    try {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext("2d")!

      // Set high resolution for better quality
      const scale = 2
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        // Set canvas size to match image with high DPI
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.style.width = img.width + "px"
        canvas.style.height = img.height + "px"

        // Scale context for high DPI
        ctx.scale(scale, scale)

        // Draw the floor plan image
        ctx.drawImage(img, 0, 0, img.width, img.height)

        // Draw room overlays (subtle)
        floorPlan.rooms.forEach((room) => {
          ctx.fillStyle = hexToRgba(room.color || "#f0f9ff", 0.05)
          ctx.fillRect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height)

          ctx.strokeStyle = "#6b7280"
          ctx.lineWidth = 1
          ctx.setLineDash([2, 2])
          ctx.strokeRect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height)
          ctx.setLineDash([])
        })

        // Draw wiring connections
        if (showWiring) {
          connections.forEach((connection) => {
            ctx.strokeStyle = connection.type === "power" ? "#dc2626" : "#f59e0b"
            ctx.lineWidth = connection.amperage > 10 ? 3 : 2
            ctx.globalAlpha = 0.8

            if (connection.type === "control") {
              ctx.setLineDash([5, 5])
            }

            // Parse and draw the path
            const pathCommands = connection.path.split(" ")
            ctx.beginPath()

            for (let i = 0; i < pathCommands.length; i++) {
              const command = pathCommands[i]
              if (command.startsWith("M")) {
                const coords = command.substring(1).split(",")
                ctx.moveTo(Number.parseFloat(coords[0]), Number.parseFloat(coords[1]))
              } else if (command.startsWith("L")) {
                const coords = command.substring(1).split(",")
                ctx.lineTo(Number.parseFloat(coords[0]), Number.parseFloat(coords[1]))
              }
            }

            ctx.stroke()
            ctx.setLineDash([])
            ctx.globalAlpha = 1
          })
        }

        // Draw electrical components
        components.forEach((component) => {
          const radius = component.type === "MDB" ? 10 : component.type === "socket15A" ? 8 : 6

          // Draw component circle
          ctx.fillStyle = getComponentColor(component.type)
          ctx.strokeStyle = "white"
          ctx.lineWidth = 2

          ctx.beginPath()
          ctx.arc(component.x, component.y, radius, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()

          // Draw component icon (simplified for canvas)
          ctx.fillStyle = "white"
          ctx.font = "bold 12px Arial"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          const iconText = getComponentIconText(component.type)
          ctx.fillText(iconText, component.x, component.y)

          // Draw labels
          if (showLabels) {
            ctx.fillStyle = "#1f2937"
            ctx.font = "11px Arial"
            ctx.strokeStyle = "white"
            ctx.lineWidth = 3

            const labelText = `${component.type}${component.amperage ? ` (${component.amperage}A)` : ""}`

            // Draw text outline for better visibility
            ctx.strokeText(labelText, component.x, component.y + 25)
            ctx.fillText(labelText, component.x, component.y + 25)
          }
        })

        // Add title and legend
        drawTitleAndLegend(ctx, img.width, img.height)

        // Download the canvas as image
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `electrical-layout-${floorPlan.name || "floor-plan"}-${new Date().toISOString().split("T")[0]}.png`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }
            setIsDownloading(false)
          },
          "image/png",
          1.0,
        )
      }

      img.onerror = () => {
        console.error("Failed to load image for download")
        setIsDownloading(false)
      }

      img.src = floorPlan.imageUrl
    } catch (error) {
      console.error("Error generating download:", error)
      setIsDownloading(false)
    }
  }

  const drawTitleAndLegend = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw title
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(10, 10, width - 20, 60)
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1
    ctx.strokeRect(10, 10, width - 20, 60)

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 18px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Electrical Layout - ${floorPlan.name || "Floor Plan"}`, 20, 35)

    ctx.font = "12px Arial"
    ctx.fillText(
      `Generated: ${new Date().toLocaleDateString()} | Components: ${components.length} | Connections: ${connections.length}`,
      20,
      55,
    )

    // Draw legend
    const legendHeight = 80
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
    ctx.fillRect(10, height - legendHeight - 10, width - 20, legendHeight)
    ctx.strokeRect(10, height - legendHeight - 10, width - 20, legendHeight)

    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 14px Arial"
    ctx.fillText("Legend:", 20, height - legendHeight + 10)

    // Legend items
    const legendItems = [
      { color: "#dc2626", text: "Power Lines", y: height - legendHeight + 30 },
      { color: "#f59e0b", text: "Control Lines (Dashed)", y: height - legendHeight + 50 },
      { color: "#059669", text: "Switches", y: height - legendHeight + 30 },
      { color: "#f59e0b", text: "Lights", y: height - legendHeight + 50 },
      { color: "#3b82f6", text: "Fans", y: height - legendHeight + 70 },
    ]

    legendItems.forEach((item, index) => {
      const x = 20 + (index % 3) * 150
      const y = item.y

      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, 2 * Math.PI)
      ctx.fill()

      ctx.fillStyle = "#1f2937"
      ctx.font = "11px Arial"
      ctx.fillText(item.text, x + 15, y + 4)
    })
  }

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const getComponentIconText = (type: string): string => {
    const icons = {
      MDB: "M",
      switch: "S",
      light: "L",
      fan: "F",
      socket5A: "5",
      socket15A: "15",
      ac: "AC",
      geyser: "G",
      washing: "W",
      tv: "TV",
      exhaust: "E",
    }
    return icons[type as keyof typeof icons] || "?"
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
    return {
      totalComponents: components.length,
      totalConnections: connections.length,
      totalLoad: components.reduce((sum, c) => sum + (c.amperage || 0), 0),
      roomsCovered: new Set(components.map((c) => c.roomId)).size,
    }
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generate Electrical Layout</h3>
        <div className="flex gap-3">
          <button
            onClick={generateElectricalLayout}
            disabled={floorPlan.rooms.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerated ? "Regenerate Layout" : "Generate Electrical Layout"}
          </button>

          {isGenerated && (
            <button
              onClick={downloadElectricalLayout}
              disabled={isDownloading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? "Generating..." : "Download Layout"}
            </button>
          )}
        </div>
      </div>

      {floorPlan.rooms.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please annotate some rooms first before generating the electrical layout.</p>
        </div>
      )}

      {isGenerated && (
        <div className="flex gap-4 mb-4">
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
        </div>
      )}

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

      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
        <img
          src={floorPlan.imageUrl || "/placeholder.svg"}
          alt="Floor plan with electrical layout"
          className="w-full h-auto max-h-[600px] object-contain"
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Room overlays - subtle */}
          {floorPlan.rooms.map((room) => (
            <rect
              key={`room-overlay-${room.id}`}
              x={room.bounds.x}
              y={room.bounds.y}
              width={room.bounds.width}
              height={room.bounds.height}
              fill={room.color || "#f0f9ff"}
              fillOpacity="0.05"
              stroke="#6b7280"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}

          {/* Wiring connections */}
          {showWiring &&
            isGenerated &&
            connections.map((connection) => (
              <g key={connection.id}>
                <path
                  d={connection.path}
                  stroke={connection.type === "power" ? "#dc2626" : "#f59e0b"}
                  strokeWidth={connection.amperage > 10 ? "3" : "2"}
                  fill="none"
                  opacity="0.8"
                  strokeDasharray={connection.type === "control" ? "5,5" : "none"}
                />
              </g>
            ))}

          {/* Electrical components */}
          {isGenerated &&
            components.map((component) => (
              <g key={component.id}>
                <circle
                  cx={component.x}
                  cy={component.y}
                  r={component.type === "MDB" ? 10 : component.type === "socket15A" ? 8 : 6}
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
                  <text
                    x={component.x}
                    y={component.y + 25}
                    textAnchor="middle"
                    className="text-xs fill-gray-900 font-medium"
                    style={{
                      textShadow: "1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white",
                      fontSize: "11px",
                    }}
                  >
                    {component.type}
                    {component.amperage && ` (${component.amperage}A)`}
                  </text>
                )}
              </g>
            ))}
        </svg>
      </div>

      {/* Hidden canvas for download generation */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Debug information */}
      {isGenerated && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Generation Summary</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>Rooms processed: {floorPlan.rooms.length}</div>
            <div>Components generated: {components.length}</div>
            <div>Connections created: {connections.length}</div>
            <div>
              Component types:{" "}
              {Object.entries(
                components.reduce(
                  (acc, c) => {
                    acc[c.type] = (acc[c.type] || 0) + 1
                    return acc
                  },
                  {} as Record<string, number>,
                ),
              )
                .map(([type, count]) => `${type}(${count})`)
                .join(", ")}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
