"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { FloorPlanData, Room } from "@/lib/floor-plan-generator"

interface FloorPlanCanvasProps {
  floorPlan: FloorPlanData
}

// Constants for drawing styles
const WALL_THICKNESS_EXTERIOR = 0.75 // 9 inches
const WALL_THICKNESS_INTERIOR = 0.375 // 4.5 inches
const FONT_ARCHITECT = "Calibri, sans-serif"

export default function FloorPlanCanvas({ floorPlan }: FloorPlanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!canvasRef.current || !floorPlan) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = canvas.parentElement
    if (!container) return

    // High-DPI rendering
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.width * 0.75 * dpr // Maintain 4:3 aspect ratio
    ctx.scale(dpr, dpr)

    const baseScale = Math.min(
      (container.clientWidth - 100) / floorPlan.plotDimensions.length,
      (container.clientHeight - 100) / floorPlan.plotDimensions.width,
    )
    setScale(baseScale)

    drawArchitecturalPlan(ctx, floorPlan, baseScale)
  }, [floorPlan])

  const drawArchitecturalPlan = (ctx: CanvasRenderingContext2D, plan: FloorPlanData, currentScale: number) => {
    ctx.font = `10px ${FONT_ARCHITECT}`
    const offsetX = 50
    const offsetY = 50

    // Clear canvas with a light grey background
    ctx.fillStyle = "#F8F9FA"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.save()
    ctx.translate(offsetX, offsetY)

    // --- 1. Draw Walls with Thickness ---
    const wallSegments = calculateWallSegments(plan.rooms, plan.openConcept)
    drawWalls(ctx, wallSegments, currentScale)

    // --- 2. Draw Room Interiors (Floor and Labels) ---
    drawRoomInteriors(ctx, plan.rooms, currentScale, plan.openConcept)

    // --- 3. Carve out Doors and Windows from Walls and Draw Symbols ---
    drawDoorsAndWindows(ctx, plan, currentScale)

    // --- 4. Draw Staircase ---
    if (plan.staircase) {
      drawStaircase(ctx, plan.staircase, currentScale)
    }

    // --- 5. Draw Furniture ---
    drawFurniture(ctx, plan.rooms, currentScale)

    // --- 6. Draw Dimension Lines ---
    drawDimensionLines(ctx, plan.rooms, currentScale)

    ctx.restore() // Restore from translate

    // --- 7. Draw Title Block, North Arrow, and Scale Bar ---
    drawTitleBlock(ctx, plan)
    drawNorthArrow(ctx, ctx.canvas.width / window.devicePixelRatio - 70, 60)
    drawScaleBar(ctx, 50, ctx.canvas.height / window.devicePixelRatio - 30, currentScale)
  }

  const calculateWallSegments = (rooms: Room[], openConcept: boolean) => {
    const segments = new Map<string, { room1: Room; room2: Room | null }>()

    rooms.forEach((room) => {
      const { x, y, width, height } = room
      const segmentsData = [
        { x1: x, y1: y, x2: x + width, y2: y, type: "top" },
        { x1: x, y1: y + height, x2: x + width, y2: y + height, type: "bottom" },
        { x1: x, y1: y, x2: x, y2: y + height, type: "left" },
        { x1: x + width, y1: y, x2: x + width, y2: y + height, type: "right" },
      ]

      segmentsData.forEach(({ x1, y1, x2, y2 }) => {
        const key = `${Math.min(x1, x2)},${Math.min(y1, y2)},${Math.max(x1, x2)},${Math.max(y1, y2)}`
        if (segments.has(key)) {
          segments.get(key)!.room2 = room
        } else {
          segments.set(key, { room1: room, room2: null })
        }
      })
    })

    if (openConcept) {
      const living = rooms.find((r) => r.type === "living")
      const kitchen = rooms.find((r) => r.type === "kitchen")
      if (living && kitchen) {
        // Find and remove the shared wall segment
        const sharedX1 = Math.max(living.x, kitchen.x)
        const sharedY1 = Math.max(living.y, kitchen.y)
        const sharedX2 = Math.min(living.x + living.width, kitchen.x + kitchen.width)
        const sharedY2 = Math.min(living.y + living.height, kitchen.y + kitchen.height)

        const key = `${sharedX1},${sharedY1},${sharedX2},${sharedY2}`
        if (segments.has(key)) {
          segments.delete(key)
        }
      }
    }
    return segments
  }

  const drawWalls = (ctx: CanvasRenderingContext2D, segments: Map<string, any>, s: number) => {
    ctx.fillStyle = "#343A40" // Dark grey for walls
    segments.forEach((seg, key) => {
      const [x1, y1, x2, y2] = key.split(",").map(Number)
      const isExterior = seg.room2 === null
      const thickness = (isExterior ? WALL_THICKNESS_EXTERIOR : WALL_THICKNESS_INTERIOR) * s

      ctx.beginPath()
      if (y1 === y2) {
        // Horizontal wall
        ctx.rect(x1 * s, y1 * s - thickness / 2, (x2 - x1) * s, thickness)
      } else {
        // Vertical wall
        ctx.rect(x1 * s - thickness / 2, y1 * s, thickness, (y2 - y1) * s)
      }
      ctx.fill()
    })
  }

  const drawRoomInteriors = (ctx: CanvasRenderingContext2D, rooms: Room[], s: number, openConcept: boolean) => {
    rooms.forEach((room) => {
      const x = room.x * s
      const y = room.y * s
      const width = room.width * s
      const height = room.height * s

      // Draw vibrant color with transparency
      if (room.type !== "corridor") {
        ctx.globalAlpha = 0.6 // Set transparency for the color fill
        ctx.fillStyle = getVibrantRoomColor(room.type)
        ctx.fillRect(x, y, width, height)
        ctx.globalAlpha = 1.0 // Reset transparency
      }

      // Room Label
      ctx.fillStyle = "#000000" // Black for better contrast on color
      ctx.font = `bold 11px ${FONT_ARCHITECT}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(room.name.toUpperCase(), x + width / 2, y + height / 2 - 8)

      ctx.font = `9px ${FONT_ARCHITECT}`
      ctx.fillStyle = "#343A40"
      ctx.fillText(`${room.width}' x ${room.height}'`, x + width / 2, y + height / 2 + 8)
    })

    // Delineate open kitchen with a dashed line
    if (openConcept) {
      const kitchen = rooms.find((r) => r.type === "kitchen")
      if (kitchen) {
        const x = kitchen.x * s
        const y = kitchen.y * s
        const height = kitchen.height * s

        ctx.strokeStyle = "#343A40"
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + height)
        ctx.stroke()
        ctx.setLineDash([])
      }
    }
  }

  const drawDoorsAndWindows = (ctx: CanvasRenderingContext2D, plan: FloorPlanData, s: number) => {
    const wallThicknessExt = WALL_THICKNESS_EXTERIOR * s
    const wallThicknessInt = WALL_THICKNESS_INTERIOR * s

    // Windows
    plan.windows.forEach((win) => {
      const x = win.x * s
      const y = win.y * s
      const width = win.width * s
      const height = win.height * s

      // Carve out space in the wall
      ctx.fillStyle = "#F8F9FA" // Background color
      if (win.orientation === "horizontal") {
        ctx.fillRect(x, y - wallThicknessExt / 2, width, wallThicknessExt)
      } else {
        ctx.fillRect(x - wallThicknessExt / 2, y, wallThicknessExt, height)
      }

      // Draw window symbol
      ctx.strokeStyle = "#6C757D"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (win.orientation === "horizontal") {
        ctx.moveTo(x, y)
        ctx.lineTo(x + width, y)
      } else {
        ctx.moveTo(x, y)
        ctx.lineTo(x, y + height)
      }
      ctx.stroke()
    })

    // Doors
    plan.doors.forEach((door) => {
      const x = door.x * s
      const y = door.y * s
      const width = door.width * s
      const height = door.height * s
      const thickness = wallThicknessInt

      // Carve out space
      ctx.fillStyle = "#F8F9FA"
      if (door.orientation === "horizontal") {
        ctx.fillRect(x, y - thickness / 2, width, thickness)
      } else {
        ctx.fillRect(x - thickness / 2, y, thickness, height)
      }

      // Draw door swing
      ctx.strokeStyle = "#ADB5BD"
      ctx.lineWidth = 1
      ctx.beginPath()
      if (door.orientation === "horizontal") {
        ctx.arc(x, y, width, 0, Math.PI / 2)
      } else {
        ctx.arc(x, y, height, Math.PI / 2, Math.PI)
      }
      ctx.stroke()
    })
  }

  const drawStaircase = (ctx: CanvasRenderingContext2D, staircase: any, s: number) => {
    const x = staircase.x * s
    const y = staircase.y * s
    const width = staircase.width * s
    const height = staircase.height * s

    ctx.strokeStyle = "#6C757D"
    ctx.lineWidth = 1

    // Outline
    ctx.strokeRect(x, y, width, height)

    // Treads
    const numberOfTreads = 12
    const treadDepth = height / numberOfTreads
    for (let i = 1; i < numberOfTreads; i++) {
      ctx.beginPath()
      ctx.moveTo(x, y + i * treadDepth)
      ctx.lineTo(x + width, y + i * treadDepth)
      ctx.stroke()
    }

    // Direction arrow
    ctx.beginPath()
    ctx.moveTo(x + width / 2, y + height - 5)
    ctx.lineTo(x + width / 2, y + 5)
    ctx.lineTo(x + width / 2 - 3, y + 10)
    ctx.moveTo(x + width / 2, y + 5)
    ctx.lineTo(x + width / 2 + 3, y + 10)
    ctx.stroke()
    ctx.font = `bold 9px ${FONT_ARCHITECT}`
    ctx.fillStyle = "#343A40"
    ctx.fillText("UP", x + width / 2 + 10, y + height / 2)
  }

  const drawFurniture = (ctx: CanvasRenderingContext2D, rooms: Room[], s: number) => {
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)" // Darker, semi-transparent furniture
    ctx.lineWidth = 1.5
    rooms.forEach((room) => {
      const x = room.x * s
      const y = room.y * s
      const w = room.width * s
      const h = room.height * s

      if (room.type === "bedroom") {
        // Bed
        ctx.strokeRect(x + w * 0.1, y + h / 2 - (5 * s) / 2, 6.5 * s, 5 * s)
        // Wardrobe
        ctx.strokeRect(x + w - 2 * s, y + h * 0.1, 2 * s, h * 0.8)
      } else if (room.type === "living") {
        // Sofa
        ctx.strokeRect(x + w * 0.1, y + h * 0.1, 8 * s, 3 * s)
        // Coffee table
        ctx.strokeRect(x + w * 0.1 + 2.5 * s, y + h * 0.1 + 4 * s, 3 * s, 2 * s)
      } else if (room.type === "kitchen") {
        // Counter
        ctx.strokeRect(x, y, w, 2 * s)
      }
    })
  }

  const drawDimensionLines = (ctx: CanvasRenderingContext2D, rooms: Room[], s: number) => {
    ctx.strokeStyle = "#007BFF"
    ctx.fillStyle = "#007BFF"
    ctx.font = `8px ${FONT_ARCHITECT}`
    ctx.lineWidth = 0.5

    const drawDim = (x1: number, y1: number, x2: number, y2: number, text: string) => {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Ticks
      const angle = Math.atan2(y2 - y1, x2 - x1)
      ctx.save()
      ctx.translate(x1, y1)
      ctx.rotate(angle + Math.PI / 4)
      ctx.moveTo(0, 0)
      ctx.lineTo(5, 0)
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.translate(x2, y2)
      ctx.rotate(angle - Math.PI / 4)
      ctx.moveTo(0, 0)
      ctx.lineTo(-5, 0)
      ctx.stroke()
      ctx.restore()

      // Text
      ctx.save()
      ctx.translate((x1 + x2) / 2, (y1 + y2) / 2)
      ctx.rotate(angle)
      ctx.fillStyle = "#FFF"
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillText(text, 0, -2)
      ctx.globalCompositeOperation = "source-over"
      ctx.fillStyle = "#007BFF"
      ctx.fillText(text, 0, -2)
      ctx.restore()
    }

    // Overall dimensions
    const minX = Math.min(...rooms.map((r) => r.x))
    const maxX = Math.max(...rooms.map((r) => r.x + r.width))
    const minY = Math.min(...rooms.map((r) => r.y))
    const maxY = Math.max(...rooms.map((r) => r.y + r.height))

    drawDim(minX * s, (minY - 4) * s, maxX * s, (minY - 4) * s, `${maxX - minX}'`)
    drawDim((minX - 4) * s, minY * s, (minX - 4) * s, maxY * s, `${maxY - minY}'`)
  }

  const drawTitleBlock = (ctx: CanvasRenderingContext2D, plan: FloorPlanData) => {
    const x = 50
    const y = ctx.canvas.height / window.devicePixelRatio - 80
    ctx.strokeStyle = "#343A40"
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, 250, 50)

    ctx.fillStyle = "#343A40"
    ctx.font = `bold 12px ${FONT_ARCHITECT}`
    ctx.fillText("PROJECT: FLOOR PLAN GENERATOR", x + 10, y + 18)

    ctx.font = `10px ${FONT_ARCHITECT}`
    ctx.fillText(`PLOT: ${plan.plotDimensions.length}' x ${plan.plotDimensions.width}'`, x + 10, y + 34)
    ctx.fillText(`FACING: ${plan.facingDirection.toUpperCase()}`, x + 150, y + 34)
  }

  const drawNorthArrow = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = "#343A40"
    ctx.fillStyle = "#343A40"
    ctx.lineWidth = 1.5

    ctx.beginPath()
    ctx.arc(x, y, 20, 0, 2 * Math.PI)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(x, y - 15)
    ctx.lineTo(x - 5, y)
    ctx.lineTo(x + 5, y)
    ctx.closePath()
    ctx.fill()

    ctx.font = `bold 14px ${FONT_ARCHITECT}`
    ctx.fillText("N", x, y + 12)
  }

  const drawScaleBar = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number) => {
    ctx.fillStyle = "#343A40"
    ctx.strokeStyle = "#343A40"
    ctx.lineWidth = 1
    const barLength = 10 * s // Represents 10 feet

    ctx.strokeRect(x, y, barLength, 5)
    ctx.fillRect(x, y, barLength / 2, 5)

    ctx.font = `9px ${FONT_ARCHITECT}`
    ctx.fillText("0'", x - 3, y + 15)
    ctx.fillText("5'", x + barLength / 2 - 3, y + 15)
    ctx.fillText("10'", x + barLength - 5, y + 15)
  }

  const getVibrantRoomColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      living: "#FFF3BF", // Light Yellow
      bedroom: "#DDEBF7", // Light Blue
      kitchen: "#E2F0D9", // Light Green
      bathroom: "#FCE4D6", // Light Orange
      dining: "#FFF3BF",
      pooja: "#F2F2F2", // Light Grey
      study: "#E0E0E0",
      store: "#D9D9D9",
      utility: "#C9C9C9",
      parking: "#BFBFBF",
    }
    return colors[type] || "#FFFFFF"
  }

  const downloadPlan = () => {
    if (!canvasRef.current) return
    const link = document.createElement("a")
    link.download = `professional-floor-plan-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">Architectural Draft</h3>
        <Button onClick={downloadPlan} size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download High-Res PNG
        </Button>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>
    </div>
  )
}
