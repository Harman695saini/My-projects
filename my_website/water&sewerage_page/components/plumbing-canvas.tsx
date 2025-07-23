"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"

interface Point {
  x: number
  y: number
}

interface PlumbingElement {
  id: string
  type: "water-supply" | "drainage" | "fixture" | "connection" | "vent"
  points: Point[]
  color: string
  width: number
  label?: string
}

interface PlumbingCanvasProps {
  backgroundImage: string
  currentTool: string
  elements: PlumbingElement[]
  onElementsChange: (elements: PlumbingElement[]) => void
}

export default function PlumbingCanvas({
  backgroundImage,
  currentTool,
  elements,
  onElementsChange,
}: PlumbingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  const getToolConfig = (tool: string) => {
    const configs = {
      "water-supply": { color: "#2563eb", width: 3, label: "Water Supply" },
      "hot-water": { color: "#dc2626", width: 3, label: "Hot Water" },
      drainage: { color: "#16a34a", width: 4, label: "Drainage" },
      "soil-pipe": { color: "#1f2937", width: 5, label: "Soil Pipe" },
      vent: { color: "#7c3aed", width: 2, label: "Vent Stack" },
      fixture: { color: "#0891b2", width: 8, label: "Fixture" },
      connection: { color: "#ea580c", width: 6, label: "Connection" },
    }
    return configs[tool as keyof typeof configs] || configs["water-supply"]
  }

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

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

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        // Draw existing elements
        drawElements(ctx)

        // Draw current path being drawn
        if (currentPath.length > 0) {
          const config = getToolConfig(currentTool)
          drawPath(ctx, currentPath, config.color, config.width)
        }
      }
      img.src = backgroundImage
    } else {
      // Draw existing elements without background
      drawElements(ctx)

      // Draw current path being drawn
      if (currentPath.length > 0) {
        const config = getToolConfig(currentTool)
        drawPath(ctx, currentPath, config.color, config.width)
      }
    }
  }, [backgroundImage, imageLoaded, elements, currentPath, currentTool])

  const drawElements = (ctx: CanvasRenderingContext2D) => {
    elements.forEach((element) => {
      if (element.type === "fixture" || element.type === "connection") {
        // Draw as circles for fixtures and connections
        element.points.forEach((point) => {
          ctx.beginPath()
          ctx.arc(point.x, point.y, element.width / 2, 0, 2 * Math.PI)
          ctx.fillStyle = element.color
          ctx.fill()
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.stroke()
        })
      } else {
        // Draw as lines for pipes
        drawPath(ctx, element.points, element.color, element.width)
      }
    })
  }

  const drawPath = (ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) => {
    if (points.length < 2) return

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

    // Add arrow indicators for flow direction on drainage lines
    if (color === "#16a34a" || color === "#1f2937") {
      drawFlowArrows(ctx, points, color)
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
      const arrowLength = 8

      ctx.beginPath()
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle - Math.PI / 6), midY - arrowLength * Math.sin(angle - Math.PI / 6))
      ctx.moveTo(midX, midY)
      ctx.lineTo(midX - arrowLength * Math.cos(angle + Math.PI / 6), midY - arrowLength * Math.sin(angle + Math.PI / 6))
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }
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

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === "select") return

    const pos = getMousePos(e)

    if (currentTool === "fixture" || currentTool === "connection") {
      // Place single point for fixtures and connections
      const config = getToolConfig(currentTool)
      const newElement: PlumbingElement = {
        id: Date.now().toString(),
        type: currentTool as any,
        points: [pos],
        color: config.color,
        width: config.width,
        label: config.label,
      }
      onElementsChange([...elements, newElement])
    } else {
      // Start drawing line for pipes
      setIsDrawing(true)
      setCurrentPath([pos])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool === "fixture" || currentTool === "connection") return

    const pos = getMousePos(e)
    setCurrentPath((prev) => [...prev, pos])
  }

  const handleMouseUp = () => {
    if (!isDrawing) return

    if (currentPath.length > 1) {
      const config = getToolConfig(currentTool)
      const newElement: PlumbingElement = {
        id: Date.now().toString(),
        type: currentTool as any,
        points: currentPath,
        color: config.color,
        width: config.width,
        label: config.label,
      }
      onElementsChange([...elements, newElement])
    }

    setIsDrawing(false)
    setCurrentPath([])
  }

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full border border-gray-200 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  )
}
