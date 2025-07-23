"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"

interface Point {
  x: number
  y: number
}

interface Room {
  id: string
  type: string
  bounds: { x: number; y: number; width: number; height: number }
  label: string
}

interface AutoPlumbingCanvasProps {
  backgroundImage: string
  currentMode: string
  rooms: Room[]
  onRoomsChange: (rooms: Room[]) => void
  plumbingSystem: any[]
  mainConnections: any
  onMainConnectionsChange: (connections: any) => void
  onSaveHistory: () => void
}

export default function AutoPlumbingCanvas({
  backgroundImage,
  currentMode,
  rooms,
  onRoomsChange,
  plumbingSystem,
  mainConnections,
  onMainConnectionsChange,
  onSaveHistory,
}: AutoPlumbingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentRect, setCurrentRect] = useState<any>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showRoomDialog, setShowRoomDialog] = useState(false)
  const [pendingRoom, setPendingRoom] = useState<any>(null)
  const [canvasScale, setCanvasScale] = useState({ scaleX: 1, scaleY: 1 })
  const [imageOffset, setImageOffset] = useState({ offsetX: 0, offsetY: 0 })

  // High resolution canvas dimensions
  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 900

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with white background for better export quality
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw background image
    if (backgroundImage && imageLoaded) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Calculate aspect ratio and fit image to canvas
        const aspectRatio = img.width / img.height
        let drawWidth = canvas.width
        let drawHeight = canvas.height

        if (aspectRatio > canvas.width / canvas.height) {
          drawHeight = canvas.width / aspectRatio
        } else {
          drawWidth = canvas.height * aspectRatio
        }

        const offsetX = (canvas.width - drawWidth) / 2
        const offsetY = (canvas.height - drawHeight) / 2

        // Store image offset and scale for coordinate transformation
        setImageOffset({ offsetX, offsetY })
        setCanvasScale({
          scaleX: drawWidth / canvas.width,
          scaleY: drawHeight / canvas.height,
        })

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        // Draw plumbing system FIRST (behind everything)
        drawPlumbingSystem(ctx)

        // Draw main connections
        drawMainConnections(ctx)

        // Draw rooms (on top)
        drawRooms(ctx)

        // Draw current selection
        if (currentRect && currentMode === "room-select") {
          drawSelectionRect(ctx, currentRect)
        }
      }
      img.src = backgroundImage
    } else {
      // Draw without background
      drawPlumbingSystem(ctx)
      drawMainConnections(ctx)
      drawRooms(ctx)

      if (currentRect && currentMode === "room-select") {
        drawSelectionRect(ctx, currentRect)
      }
    }
  }, [backgroundImage, imageLoaded, rooms, plumbingSystem, mainConnections, currentRect, currentMode])

  const drawRooms = (ctx: CanvasRenderingContext2D) => {
    rooms.forEach((room) => {
      // Draw room boundary with thicker, more visible lines
      ctx.strokeStyle = getRoomColor(room.type)
      ctx.lineWidth = 4
      ctx.setLineDash([10, 5])
      ctx.strokeRect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height)

      // Fill with very light transparent color
      ctx.fillStyle = getRoomColor(room.type) + "08"
      ctx.fillRect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height)

      // Draw room label with better styling
      ctx.fillStyle = getRoomColor(room.type)
      ctx.font = "bold 18px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Add text background for better readability
      const textWidth = ctx.measureText(room.label).width
      const textX = room.bounds.x + room.bounds.width / 2
      const textY = room.bounds.y + 25

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(textX - textWidth / 2 - 8, textY - 12, textWidth + 16, 24)
      ctx.strokeStyle = getRoomColor(room.type)
      ctx.lineWidth = 2
      ctx.strokeRect(textX - textWidth / 2 - 8, textY - 12, textWidth + 16, 24)

      ctx.fillStyle = getRoomColor(room.type)
      ctx.fillText(room.label, textX, textY)

      ctx.setLineDash([])
    })
  }

  const drawPlumbingSystem = (ctx: CanvasRenderingContext2D) => {
    // Draw pipes first (behind fixtures)
    plumbingSystem.forEach((element) => {
      if (element.type !== "fixture") {
        drawPipeLine(ctx, element.points, element.color, element.width, element.type)

        // Add flow arrows for drainage
        if (element.type === "drainage" || element.type === "soil-pipe") {
          drawFlowArrows(ctx, element.points, element.color)
        }
      }
    })

    // Draw connection joints at pipe intersections
    drawPipeConnections(ctx)

    // Draw fixtures on top
    plumbingSystem.forEach((element) => {
      if (element.type === "fixture") {
        element.points.forEach((point: Point) => {
          drawFixture(ctx, point, element)
        })
      }
    })
  }

  const drawPipeConnections = (ctx: CanvasRenderingContext2D) => {
    const connectionPoints = new Map<string, { point: Point; pipes: any[] }>()

    // Find all connection points where pipes meet
    plumbingSystem.forEach((element) => {
      if (element.type !== "fixture") {
        element.points.forEach((point: Point) => {
          const key = `${Math.round(point.x)},${Math.round(point.y)}`
          if (!connectionPoints.has(key)) {
            connectionPoints.set(key, { point, pipes: [] })
          }
          connectionPoints.get(key)!.pipes.push(element)
        })
      }
    })

    // Draw connection joints where multiple pipes meet
    connectionPoints.forEach(({ point, pipes }) => {
      if (pipes.length > 1) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI)
        ctx.fillStyle = "#1f2937"
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  const drawFixture = (ctx: CanvasRenderingContext2D, point: Point, element: any) => {
    // Draw fixture with enhanced styling
    ctx.beginPath()
    ctx.arc(point.x, point.y, element.width / 2, 0, 2 * Math.PI)
    ctx.fillStyle = element.color
    ctx.fill()
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.stroke()

    // Add inner detail for better visibility
    ctx.beginPath()
    ctx.arc(point.x, point.y, element.width / 4, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.fill()

    // Draw fixture label with enhanced background
    if (element.label) {
      ctx.font = "bold 12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const textWidth = ctx.measureText(element.label).width
      const labelY = point.y + element.width / 2 + 20

      // Background for label
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(point.x - textWidth / 2 - 4, labelY - 8, textWidth + 8, 16)
      ctx.strokeStyle = element.color
      ctx.lineWidth = 1
      ctx.strokeRect(point.x - textWidth / 2 - 4, labelY - 8, textWidth + 8, 16)

      ctx.fillStyle = "#000000"
      ctx.fillText(element.label, point.x, labelY)
    }

    // Draw connection indicators to show where pipes connect
    drawFixtureConnections(ctx, point, element)
  }

  const drawFixtureConnections = (ctx: CanvasRenderingContext2D, fixturePoint: Point, fixture: any) => {
    // Find pipes that connect to this fixture
    const connectedPipes = plumbingSystem.filter((element) => {
      if (element.type === "fixture") return false
      return element.points.some((point: Point) => {
        const distance = Math.sqrt(Math.pow(point.x - fixturePoint.x, 2) + Math.pow(point.y - fixturePoint.y, 2))
        return distance < 20 // Connection threshold
      })
    })

    // Draw small connection indicators
    connectedPipes.forEach((pipe) => {
      const connectionPoint = pipe.points.find((point: Point) => {
        const distance = Math.sqrt(Math.pow(point.x - fixturePoint.x, 2) + Math.pow(point.y - fixturePoint.y, 2))
        return distance < 20
      })

      if (connectionPoint) {
        // Draw connection line
        ctx.beginPath()
        ctx.moveTo(fixturePoint.x, fixturePoint.y)
        ctx.lineTo(connectionPoint.x, connectionPoint.y)
        ctx.strokeStyle = pipe.color
        ctx.lineWidth = 3
        ctx.stroke()

        // Draw connection point
        ctx.beginPath()
        ctx.arc(connectionPoint.x, connectionPoint.y, 4, 0, 2 * Math.PI)
        ctx.fillStyle = pipe.color
        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    })
  }

  const drawMainConnections = (ctx: CanvasRenderingContext2D) => {
    // Draw water source with enhanced visibility
    if (mainConnections.waterSource) {
      // Main circle
      ctx.beginPath()
      ctx.arc(mainConnections.waterSource.x, mainConnections.waterSource.y, 15, 0, 2 * Math.PI)
      ctx.fillStyle = "#2563eb"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 4
      ctx.stroke()

      // Inner detail
      ctx.beginPath()
      ctx.arc(mainConnections.waterSource.x, mainConnections.waterSource.y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.fill()

      // Enhanced label
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      const labelY = mainConnections.waterSource.y - 25
      const textWidth = ctx.measureText("WATER SOURCE").width

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(mainConnections.waterSource.x - textWidth / 2 - 6, labelY - 10, textWidth + 12, 20)
      ctx.strokeStyle = "#2563eb"
      ctx.lineWidth = 2
      ctx.strokeRect(mainConnections.waterSource.x - textWidth / 2 - 6, labelY - 10, textWidth + 12, 20)

      ctx.fillStyle = "#000000"
      ctx.fillText("WATER SOURCE", mainConnections.waterSource.x, labelY)

      // Draw connection lines to show distribution
      drawMainWaterDistribution(ctx)
    }

    // Draw main drain with enhanced visibility
    if (mainConnections.mainDrain) {
      ctx.beginPath()
      ctx.arc(mainConnections.mainDrain.x, mainConnections.mainDrain.y, 15, 0, 2 * Math.PI)
      ctx.fillStyle = "#16a34a"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 4
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(mainConnections.mainDrain.x, mainConnections.mainDrain.y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.fill()

      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      const labelY = mainConnections.mainDrain.y - 25
      const textWidth = ctx.measureText("MAIN DRAIN").width

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(mainConnections.mainDrain.x - textWidth / 2 - 6, labelY - 10, textWidth + 12, 20)
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 2
      ctx.strokeRect(mainConnections.mainDrain.x - textWidth / 2 - 6, labelY - 10, textWidth + 12, 20)

      ctx.fillStyle = "#000000"
      ctx.fillText("MAIN DRAIN", mainConnections.mainDrain.x, labelY)

      // Draw collection lines
      drawMainDrainCollection(ctx)
    }

    // Draw sewer connection
    if (mainConnections.sewerConnection) {
      ctx.beginPath()
      ctx.arc(mainConnections.sewerConnection.x, mainConnections.sewerConnection.y, 15, 0, 2 * Math.PI)
      ctx.fillStyle = "#1f2937"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 4
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(mainConnections.sewerConnection.x, mainConnections.sewerConnection.y, 8, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      ctx.fill()

      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      const labelY = mainConnections.sewerConnection.y - 25
      const textWidth = ctx.measureText("SEWER CONNECTION").width

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
      ctx.fillRect(mainConnections.sewerConnection.x - textWidth / 2 - 6, labelY - 10, textWidth + 12, 20)
      ctx.strokeStyle = "#1f2937"
      ctx.lineWidth = 2
      ctx.strokeRect(mainConnections.sewerConnection.x - textWidth / 2 - 6, labelY - 10, textWidth + 12, 20)

      ctx.fillStyle = "#ffffff"
      ctx.fillText("SEWER CONNECTION", mainConnections.sewerConnection.x, labelY)
    }
  }

  const drawMainWaterDistribution = (ctx: CanvasRenderingContext2D) => {
    if (!mainConnections.waterSource) return

    // Draw main distribution lines to all rooms
    rooms.forEach((room) => {
      const roomCenter = {
        x: room.bounds.x + room.bounds.width / 2,
        y: room.bounds.y + room.bounds.height / 2,
      }

      // Main distribution line
      ctx.beginPath()
      ctx.moveTo(mainConnections.waterSource.x, mainConnections.waterSource.y)
      ctx.lineTo(mainConnections.waterSource.x, mainConnections.waterSource.y + 50)
      ctx.lineTo(roomCenter.x, mainConnections.waterSource.y + 50)
      ctx.lineTo(roomCenter.x, roomCenter.y - 30)
      ctx.strokeStyle = "#1d4ed8"
      ctx.lineWidth = 6
      ctx.setLineDash([])
      ctx.stroke()

      // Add distribution junction
      ctx.beginPath()
      ctx.arc(roomCenter.x, mainConnections.waterSource.y + 50, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "#1d4ed8"
      ctx.fill()
    })
  }

  const drawMainDrainCollection = (ctx: CanvasRenderingContext2D) => {
    if (!mainConnections.mainDrain) return

    // Draw collection lines from all rooms
    rooms.forEach((room) => {
      const roomCenter = {
        x: room.bounds.x + room.bounds.width / 2,
        y: room.bounds.y + room.bounds.height / 2,
      }

      // Collection line
      ctx.beginPath()
      ctx.moveTo(roomCenter.x, roomCenter.y + 30)
      ctx.lineTo(roomCenter.x, mainConnections.mainDrain.y - 50)
      ctx.lineTo(mainConnections.mainDrain.x, mainConnections.mainDrain.y - 50)
      ctx.lineTo(mainConnections.mainDrain.x, mainConnections.mainDrain.y)
      ctx.strokeStyle = "#059669"
      ctx.lineWidth = 6
      ctx.setLineDash([])
      ctx.stroke()

      // Add collection junction
      ctx.beginPath()
      ctx.arc(roomCenter.x, mainConnections.mainDrain.y - 50, 5, 0, 2 * Math.PI)
      ctx.fillStyle = "#059669"
      ctx.fill()
    })

    // Main sewer line
    if (mainConnections.sewerConnection) {
      ctx.beginPath()
      ctx.moveTo(mainConnections.mainDrain.x, mainConnections.mainDrain.y)
      ctx.lineTo(mainConnections.sewerConnection.x, mainConnections.sewerConnection.y)
      ctx.strokeStyle = "#1f2937"
      ctx.lineWidth = 8
      ctx.stroke()
    }
  }

  const drawSelectionRect = (ctx: CanvasRenderingContext2D, rect: any) => {
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
    ctx.setLineDash([])

    ctx.fillStyle = "#3b82f6" + "20"
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
  }

  const drawPipeLine = (ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number, type: string) => {
    if (points.length < 2) return

    // Draw pipe shadow for depth
    ctx.beginPath()
    ctx.moveTo(points[0].x + 2, points[0].y + 2)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x + 2, points[i].y + 2)
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
    ctx.lineWidth = width + 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()

    // Draw main pipe
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()

    // Add pipe type indicators
    if (type === "water-supply" || type === "hot-water") {
      // Add small perpendicular lines to indicate water supply
      for (let i = 1; i < points.length; i++) {
        const start = points[i - 1]
        const end = points[i]
        const midX = (start.x + end.x) / 2
        const midY = (start.y + end.y) / 2

        const angle = Math.atan2(end.y - start.y, end.x - start.x)
        const perpAngle = angle + Math.PI / 2
        const lineLength = 8

        ctx.beginPath()
        ctx.moveTo(midX - lineLength * Math.cos(perpAngle), midY - lineLength * Math.sin(perpAngle))
        ctx.lineTo(midX + lineLength * Math.cos(perpAngle), midY + lineLength * Math.sin(perpAngle))
        ctx.strokeStyle = color
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }

  const drawFlowArrows = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
    if (points.length < 2) return

    for (let i = 1; i < points.length; i++) {
      const start = points[i - 1]
      const end = points[i]
      const midX = (start.x + end.x) / 2
      const midY = (start.y + end.y) / 2

      const angle = Math.atan2(end.y - start.y, end.x - start.x)
      const arrowLength = 15

      // Draw arrow with better visibility
      ctx.beginPath()
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle - Math.PI / 6), midY - arrowLength * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle + Math.PI / 6), midY - arrowLength * Math.sin(angle + Math.PI / 6))
      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.stroke()

      // Add arrow background for better visibility
      ctx.beginPath()
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle - Math.PI / 6), midY - arrowLength * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle + Math.PI / 6), midY - arrowLength * Math.sin(angle + Math.PI / 6))
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"
      ctx.lineWidth = 6
      ctx.stroke()

      // Redraw arrow
      ctx.beginPath()
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle - Math.PI / 6), midY - arrowLength * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle + Math.PI / 6), midY - arrowLength * Math.sin(angle + Math.PI / 6))
      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.stroke()
    }
  }

  const getRoomColor = (roomType: string) => {
    const colors = {
      bathroom: "#3b82f6",
      kitchen: "#f59e0b",
      utility: "#10b981",
      "powder-room": "#8b5cf6",
      bedroom: "#ef4444",
      "living-room": "#06b6d4",
    }
    return colors[roomType as keyof typeof colors] || "#6b7280"
  }

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => setImageLoaded(true)
      img.src = backgroundImage
    }
  }, [backgroundImage])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Fixed mouse position calculation
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const pos = getMousePos(e)

    if (currentMode === "room-select") {
      setIsDrawing(true)
      setStartPoint(pos)
      setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 })
    } else if (currentMode === "main-connections") {
      // Handle main connection placement
      const connectionType = e.shiftKey ? "sewerConnection" : e.ctrlKey || e.metaKey ? "mainDrain" : "waterSource"

      onMainConnectionsChange({
        ...mainConnections,
        [connectionType]: pos,
      })
      onSaveHistory()
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || currentMode !== "room-select") return

    const pos = getMousePos(e)
    const width = pos.x - startPoint.x
    const height = pos.y - startPoint.y

    setCurrentRect({
      x: width < 0 ? pos.x : startPoint.x,
      y: height < 0 ? pos.y : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height),
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentRect || currentMode !== "room-select") return

    if (currentRect.width > 30 && currentRect.height > 30) {
      // Show room type selection dialog
      setPendingRoom(currentRect)
      setShowRoomDialog(true)
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentRect(null)
  }

  const handleRoomTypeSelection = (roomType: string) => {
    if (!pendingRoom) return

    const newRoom: Room = {
      id: Date.now().toString(),
      type: roomType,
      bounds: pendingRoom,
      label: roomType.charAt(0).toUpperCase() + roomType.slice(1).replace("-", " "),
    }

    onRoomsChange([...rooms, newRoom])
    onSaveHistory()

    setShowRoomDialog(false)
    setPendingRoom(null)
  }

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full border border-gray-200 cursor-crosshair"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          imageRendering: "pixelated", // Better quality for scaling
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {/* Room Type Selection Dialog */}
      {showRoomDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Room Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: "bathroom", label: "Bathroom", color: "#3b82f6", desc: "WC, Basin, Shower" },
                { type: "kitchen", label: "Kitchen", color: "#f59e0b", desc: "Sink, Grease Trap" },
                { type: "utility", label: "Utility Room", color: "#10b981", desc: "Washing Machine" },
                { type: "powder-room", label: "Powder Room", color: "#8b5cf6", desc: "WC, Basin" },
              ].map((room) => (
                <button
                  key={room.type}
                  onClick={() => handleRoomTypeSelection(room.type)}
                  className="p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: room.color }} />
                    <span className="font-medium">{room.label}</span>
                  </div>
                  <div className="text-xs text-gray-500">{room.desc}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRoomDialog(false)}
              className="mt-4 w-full p-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Instructions overlay */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg text-sm shadow-lg max-w-xs">
        {currentMode === "room-select" && (
          <div>
            <div className="font-semibold text-blue-600 mb-2">🏠 Room Selection Mode</div>
            <div className="space-y-1 text-xs">
              <div>• Click and drag to select room areas</div>
              <div>• Minimum size: 30x30 pixels</div>
              <div>• Choose room type after selection</div>
              <div>• Pipes will auto-connect to fixtures</div>
            </div>
          </div>
        )}
        {currentMode === "main-connections" && (
          <div>
            <div className="font-semibold text-orange-600 mb-2">🔧 Main Connections Mode</div>
            <div className="space-y-1 text-xs">
              <div>
                • <strong>Click:</strong> Water Source
              </div>
              <div>
                • <strong>Ctrl+Click:</strong> Main Drain
              </div>
              <div>
                • <strong>Shift+Click:</strong> Sewer Connection
              </div>
              <div>• All pipes will connect automatically</div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-95 p-3 rounded-lg text-xs shadow-lg">
        <div className="font-semibold mb-2">🔗 Connection Status</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${mainConnections.waterSource ? "bg-blue-500" : "bg-gray-300"}`} />
            <span>Water Supply Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${mainConnections.mainDrain ? "bg-green-500" : "bg-gray-300"}`} />
            <span>Drainage Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${plumbingSystem.length > 0 ? "bg-purple-500" : "bg-gray-300"}`} />
            <span>Fixtures Connected</span>
          </div>
        </div>
      </div>
    </div>
  )
}
