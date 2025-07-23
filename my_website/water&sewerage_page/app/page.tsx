"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash2, Undo, Redo, Zap, Home, ImageIcon } from "lucide-react"
import AutoPlumbingCanvas from "@/components/auto-plumbing-canvas"
import RoomPanel from "@/components/room-panel"
import SystemPanel from "@/components/system-panel"
import Legend from "@/components/legend"

export default function AutoPlumbingAnalyzer() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [rooms, setRooms] = useState<any[]>([])
  const [plumbingSystem, setPlumbingSystem] = useState<any[]>([])
  const [mainConnections, setMainConnections] = useState<any>({
    waterSource: null,
    mainDrain: null,
    sewerConnection: null,
  })
  const [currentMode, setCurrentMode] = useState<string>("room-select")
  const [history, setHistory] = useState<any[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isExporting, setIsExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
        setRooms([])
        setPlumbingSystem([])
        setMainConnections({ waterSource: null, mainDrain: null, sewerConnection: null })
        setHistory([])
        setHistoryIndex(-1)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveToHistory = () => {
    const currentState = {
      rooms: [...rooms],
      plumbingSystem: [...plumbingSystem],
      mainConnections: { ...mainConnections },
    }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(currentState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setRooms([...prevState.rooms])
      setPlumbingSystem([...prevState.plumbingSystem])
      setMainConnections({ ...prevState.mainConnections })
      setHistoryIndex(historyIndex - 1)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setRooms([...nextState.rooms])
      setPlumbingSystem([...nextState.plumbingSystem])
      setMainConnections({ ...nextState.mainConnections })
      setHistoryIndex(historyIndex + 1)
    }
  }

  const generatePlumbingForRoom = (room: any) => {
    const roomPlumbing = generateRoomPlumbing(room, mainConnections)
    setPlumbingSystem((prev) => [...prev, ...roomPlumbing])
    saveToHistory()
  }

  const generateCompleteSystem = () => {
    if (rooms.length === 0) return

    let allPlumbing: any[] = []

    rooms.forEach((room) => {
      const roomPlumbing = generateRoomPlumbing(room, mainConnections)
      allPlumbing = [...allPlumbing, ...roomPlumbing]
    })

    // Add main distribution lines
    const mainLines = generateMainDistributionLines(rooms, mainConnections)
    allPlumbing = [...allPlumbing, ...mainLines]

    setPlumbingSystem(allPlumbing)
    saveToHistory()
  }

  const clearAll = () => {
    setRooms([])
    setPlumbingSystem([])
    setMainConnections({ waterSource: null, mainDrain: null, sewerConnection: null })
    saveToHistory()
  }

  // High-quality export function
  const exportHighQualityDiagram = async () => {
    setIsExporting(true)

    try {
      // Wait a moment for the UI to update
      await new Promise((resolve) => setTimeout(resolve, 100))

      const canvas = document.querySelector("canvas") as HTMLCanvasElement
      if (!canvas) {
        throw new Error("Canvas not found")
      }

      // Create a high-resolution canvas for export
      const exportCanvas = document.createElement("canvas")
      const exportCtx = exportCanvas.getContext("2d")
      if (!exportCtx) {
        throw new Error("Could not get canvas context")
      }

      // Set high resolution (2x for retina displays)
      const scale = 2
      exportCanvas.width = canvas.width * scale
      exportCanvas.height = canvas.height * scale

      // Scale the context to ensure correct drawing operations
      exportCtx.scale(scale, scale)

      // Copy the current canvas content
      exportCtx.drawImage(canvas, 0, 0)

      // Add watermark/title
      exportCtx.fillStyle = "rgba(0, 0, 0, 0.8)"
      exportCtx.font = "bold 24px Arial"
      exportCtx.textAlign = "left"
      exportCtx.fillText("Plumbing Layout Diagram", 20, 40)

      // Add timestamp
      exportCtx.fillStyle = "rgba(0, 0, 0, 0.6)"
      exportCtx.font = "16px Arial"
      const timestamp = new Date().toLocaleDateString()
      exportCtx.fillText(`Generated: ${timestamp}`, 20, 65)

      // Convert to high-quality image
      const dataURL = exportCanvas.toDataURL("image/png", 1.0)

      // Create download link
      const link = document.createElement("a")
      link.download = `plumbing-layout-${Date.now()}.png`
      link.href = dataURL

      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Intelligent Plumbing Layout Generator</h1>
          <p className="text-gray-600">
            Select rooms and automatically generate complete plumbing systems with smart routing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Floor Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mb-4"
                  variant={uploadedImage ? "outline" : "default"}
                >
                  {uploadedImage ? "Change Image" : "Select Image"}
                </Button>
                {uploadedImage && (
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Floor plan loaded
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mode Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={currentMode === "room-select" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentMode("room-select")}
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Select Rooms
                </Button>
                <Button
                  variant={currentMode === "main-connections" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentMode("main-connections")}
                  className="w-full"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Main Connections
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                    <Redo className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={generateCompleteSystem}
                  className="w-full"
                  disabled={rooms.length === 0}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Complete System
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll} className="w-full bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>

                {/* High-Quality Export Button */}
                <div className="border-t pt-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={exportHighQualityDiagram}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={!uploadedImage || isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Export HD Image
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1 text-center">High-resolution PNG with timestamp</p>
                </div>
              </CardContent>
            </Card>

            <RoomPanel rooms={rooms} onRoomUpdate={setRooms} onGeneratePlumbing={generatePlumbingForRoom} />

            <SystemPanel mainConnections={mainConnections} onConnectionsUpdate={setMainConnections} />

            <Legend />
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="h-[800px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Intelligent Plumbing Canvas</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Mode: {currentMode.replace("-", " ").toUpperCase()}</Badge>
                    <Badge variant="secondary">Rooms: {rooms.length}</Badge>
                    <Badge variant="secondary">Elements: {plumbingSystem.length}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-full p-0">
                {uploadedImage ? (
                  <AutoPlumbingCanvas
                    backgroundImage={uploadedImage}
                    currentMode={currentMode}
                    rooms={rooms}
                    onRoomsChange={setRooms}
                    plumbingSystem={plumbingSystem}
                    mainConnections={mainConnections}
                    onMainConnectionsChange={setMainConnections}
                    onSaveHistory={saveToHistory}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Upload a Floor Plan</h3>
                      <p className="text-gray-500 mb-4">Select an image file to start automatic plumbing design</p>
                      <Button onClick={() => fileInputRef.current?.click()}>Choose File</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use Intelligent Plumbing Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">1. Upload & Setup</h4>
                <p className="text-gray-600">Upload floor plan and set main water source and drain connections</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">2. Define Rooms</h4>
                <p className="text-gray-600">
                  Click and drag to select room areas, then specify room type (bathroom, kitchen, etc.)
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">3. Auto Generate</h4>
                <p className="text-gray-600">
                  System automatically creates fixtures, pipes, and connections based on room type
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">4. Export HD Image</h4>
                <p className="text-gray-600">Download high-resolution PNG with professional quality and timestamp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to generate room-specific plumbing
function generateRoomPlumbing(room: any, mainConnections: any) {
  const plumbing: any[] = []
  const roomCenter = {
    x: room.bounds.x + room.bounds.width / 2,
    y: room.bounds.y + room.bounds.height / 2,
  }

  switch (room.type) {
    case "bathroom":
      // Generate bathroom fixtures and connections
      plumbing.push(...generateBathroomPlumbing(room, roomCenter, mainConnections))
      break
    case "kitchen":
      plumbing.push(...generateKitchenPlumbing(room, roomCenter, mainConnections))
      break
    case "utility":
      plumbing.push(...generateUtilityPlumbing(room, roomCenter, mainConnections))
      break
    case "powder-room":
      plumbing.push(...generatePowderRoomPlumbing(room, roomCenter, mainConnections))
      break
  }

  return plumbing
}

function generateBathroomPlumbing(room: any, center: any, mainConnections: any) {
  const plumbing: any[] = []
  const id = room.id

  // Fixtures
  plumbing.push({
    id: `${id}-wc`,
    type: "fixture",
    subType: "wc",
    points: [{ x: center.x - 30, y: center.y - 20 }],
    color: "#0891b2",
    width: 12,
    label: "WC",
  })

  plumbing.push({
    id: `${id}-basin`,
    type: "fixture",
    subType: "basin",
    points: [{ x: center.x + 30, y: center.y - 20 }],
    color: "#0891b2",
    width: 10,
    label: "Basin",
  })

  plumbing.push({
    id: `${id}-shower`,
    type: "fixture",
    subType: "shower",
    points: [{ x: center.x, y: center.y + 30 }],
    color: "#0891b2",
    width: 10,
    label: "Shower",
  })

  // Water supply lines
  if (mainConnections.waterSource) {
    plumbing.push({
      id: `${id}-cold-supply`,
      type: "water-supply",
      points: [
        mainConnections.waterSource,
        { x: center.x, y: mainConnections.waterSource.y },
        { x: center.x, y: center.y - 40 },
        { x: center.x - 30, y: center.y - 40 },
        { x: center.x - 30, y: center.y - 20 },
      ],
      color: "#2563eb",
      width: 3,
      label: "Cold Water Supply",
    })

    plumbing.push({
      id: `${id}-hot-supply`,
      type: "hot-water",
      points: [
        { x: center.x, y: center.y - 40 },
        { x: center.x + 30, y: center.y - 40 },
        { x: center.x + 30, y: center.y - 20 },
      ],
      color: "#dc2626",
      width: 3,
      label: "Hot Water Supply",
    })
  }

  // Drainage lines
  if (mainConnections.mainDrain) {
    plumbing.push({
      id: `${id}-drainage`,
      type: "drainage",
      points: [
        { x: center.x - 30, y: center.y - 20 },
        { x: center.x - 30, y: center.y + 40 },
        { x: mainConnections.mainDrain.x, y: center.y + 40 },
        mainConnections.mainDrain,
      ],
      color: "#16a34a",
      width: 4,
      label: "Drainage",
    })
  }

  return plumbing
}

function generateKitchenPlumbing(room: any, center: any, mainConnections: any) {
  const plumbing: any[] = []
  const id = room.id

  // Kitchen sink
  plumbing.push({
    id: `${id}-sink`,
    type: "fixture",
    subType: "sink",
    points: [{ x: center.x, y: center.y }],
    color: "#0891b2",
    width: 10,
    label: "Kitchen Sink",
  })

  // Water supply
  if (mainConnections.waterSource) {
    plumbing.push({
      id: `${id}-cold-supply`,
      type: "water-supply",
      points: [
        mainConnections.waterSource,
        { x: center.x, y: mainConnections.waterSource.y },
        { x: center.x, y: center.y },
      ],
      color: "#2563eb",
      width: 3,
      label: "Cold Water Supply",
    })
  }

  // Drainage with grease trap
  if (mainConnections.mainDrain) {
    plumbing.push({
      id: `${id}-grease-trap`,
      type: "fixture",
      subType: "grease-trap",
      points: [{ x: center.x + 20, y: center.y + 20 }],
      color: "#f59e0b",
      width: 8,
      label: "Grease Trap",
    })

    plumbing.push({
      id: `${id}-drainage`,
      type: "drainage",
      points: [
        { x: center.x, y: center.y },
        { x: center.x + 20, y: center.y + 20 },
        { x: mainConnections.mainDrain.x, y: center.y + 20 },
        mainConnections.mainDrain,
      ],
      color: "#16a34a",
      width: 4,
      label: "Kitchen Drainage",
    })
  }

  return plumbing
}

function generateUtilityPlumbing(room: any, center: any, mainConnections: any) {
  const plumbing: any[] = []
  const id = room.id

  // Washing machine connection
  plumbing.push({
    id: `${id}-washing-machine`,
    type: "fixture",
    subType: "washing-machine",
    points: [{ x: center.x, y: center.y }],
    color: "#0891b2",
    width: 10,
    label: "Washing Machine",
  })

  // Water supply
  if (mainConnections.waterSource) {
    plumbing.push({
      id: `${id}-cold-supply`,
      type: "water-supply",
      points: [
        mainConnections.waterSource,
        { x: center.x, y: mainConnections.waterSource.y },
        { x: center.x, y: center.y },
      ],
      color: "#2563eb",
      width: 3,
      label: "Cold Water Supply",
    })
  }

  // Drainage
  if (mainConnections.mainDrain) {
    plumbing.push({
      id: `${id}-drainage`,
      type: "drainage",
      points: [
        { x: center.x, y: center.y },
        { x: center.x, y: center.y + 30 },
        { x: mainConnections.mainDrain.x, y: center.y + 30 },
        mainConnections.mainDrain,
      ],
      color: "#16a34a",
      width: 4,
      label: "Utility Drainage",
    })
  }

  return plumbing
}

function generatePowderRoomPlumbing(room: any, center: any, mainConnections: any) {
  const plumbing: any[] = []
  const id = room.id

  // WC and basin only
  plumbing.push({
    id: `${id}-wc`,
    type: "fixture",
    subType: "wc",
    points: [{ x: center.x - 20, y: center.y }],
    color: "#0891b2",
    width: 12,
    label: "WC",
  })

  plumbing.push({
    id: `${id}-basin`,
    type: "fixture",
    subType: "basin",
    points: [{ x: center.x + 20, y: center.y }],
    color: "#0891b2",
    width: 10,
    label: "Basin",
  })

  // Water supply
  if (mainConnections.waterSource) {
    plumbing.push({
      id: `${id}-cold-supply`,
      type: "water-supply",
      points: [
        mainConnections.waterSource,
        { x: center.x, y: mainConnections.waterSource.y },
        { x: center.x, y: center.y - 20 },
        { x: center.x - 20, y: center.y - 20 },
        { x: center.x - 20, y: center.y },
      ],
      color: "#2563eb",
      width: 3,
      label: "Cold Water Supply",
    })
  }

  // Drainage
  if (mainConnections.mainDrain) {
    plumbing.push({
      id: `${id}-drainage`,
      type: "drainage",
      points: [
        { x: center.x - 20, y: center.y },
        { x: center.x - 20, y: center.y + 30 },
        { x: mainConnections.mainDrain.x, y: center.y + 30 },
        mainConnections.mainDrain,
      ],
      color: "#16a34a",
      width: 4,
      label: "Drainage",
    })
  }

  return plumbing
}

function generateMainDistributionLines(rooms: any[], mainConnections: any) {
  const mainLines: any[] = []

  if (mainConnections.waterSource && mainConnections.mainDrain) {
    // Main water distribution line
    mainLines.push({
      id: "main-water-line",
      type: "water-supply",
      points: [
        mainConnections.waterSource,
        { x: mainConnections.waterSource.x, y: mainConnections.waterSource.y + 50 },
        { x: mainConnections.mainDrain.x, y: mainConnections.waterSource.y + 50 },
      ],
      color: "#1d4ed8",
      width: 5,
      label: "Main Water Distribution",
    })

    // Main drainage line
    mainLines.push({
      id: "main-drain-line",
      type: "soil-pipe",
      points: [
        { x: mainConnections.mainDrain.x, y: mainConnections.mainDrain.y - 50 },
        mainConnections.mainDrain,
        mainConnections.sewerConnection || { x: mainConnections.mainDrain.x, y: mainConnections.mainDrain.y + 100 },
      ],
      color: "#1f2937",
      width: 6,
      label: "Main Soil Pipe",
    })
  }

  return mainLines
}
