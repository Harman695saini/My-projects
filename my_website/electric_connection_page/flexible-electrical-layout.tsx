"use client"

import { useState } from "react"
import type { FloorPlan } from "./types/electrical-types"
import { ElectricalGenerator } from "./components/electrical-generator"

export default function FlexibleElectricalLayout() {
  const [currentFloorPlan, setCurrentFloorPlan] = useState<FloorPlan>({
    name: "Sample Residential Layout",
    rooms: [
      { id: "living", name: "Living Room", type: "living", x: 50, y: 50, width: 300, height: 200, color: "#f0f9ff" },
      { id: "kitchen", name: "Kitchen", type: "kitchen", x: 350, y: 50, width: 200, height: 150, color: "#fef3c7" },
      {
        id: "bedroom1",
        name: "Master Bedroom",
        type: "bedroom",
        x: 50,
        y: 250,
        width: 250,
        height: 200,
        color: "#f0fdf4",
      },
      { id: "bedroom2", name: "Bedroom 2", type: "bedroom", x: 300, y: 250, width: 200, height: 150, color: "#fdf2f8" },
      {
        id: "bathroom1",
        name: "Bathroom 1",
        type: "bathroom",
        x: 500,
        y: 250,
        width: 100,
        height: 100,
        color: "#f0f4ff",
      },
      {
        id: "bathroom2",
        name: "Bathroom 2",
        type: "bathroom",
        x: 300,
        y: 400,
        width: 100,
        height: 50,
        color: "#f0f4ff",
      },
      { id: "utility", name: "Utility", type: "utility", x: 550, y: 50, width: 100, height: 100, color: "#f5f5f5" },
      { id: "entrance", name: "Entrance", type: "entrance", x: 400, y: 400, width: 150, height: 50, color: "#fafafa" },
    ],
  })

  const [customLayout, setCustomLayout] = useState("")

  const sampleLayouts = {
    residential: {
      name: "3BHK Residential",
      rooms: [
        { id: "living", name: "Living Room", type: "living", x: 50, y: 50, width: 300, height: 200, color: "#f0f9ff" },
        { id: "kitchen", name: "Kitchen", type: "kitchen", x: 350, y: 50, width: 200, height: 150, color: "#fef3c7" },
        {
          id: "bedroom1",
          name: "Master Bedroom",
          type: "bedroom",
          x: 50,
          y: 250,
          width: 250,
          height: 200,
          color: "#f0fdf4",
        },
        {
          id: "bedroom2",
          name: "Bedroom 2",
          type: "bedroom",
          x: 300,
          y: 250,
          width: 200,
          height: 150,
          color: "#fdf2f8",
        },
        {
          id: "bathroom1",
          name: "Bathroom 1",
          type: "bathroom",
          x: 500,
          y: 250,
          width: 100,
          height: 100,
          color: "#f0f4ff",
        },
        { id: "utility", name: "Utility", type: "utility", x: 550, y: 50, width: 100, height: 100, color: "#f5f5f5" },
        {
          id: "entrance",
          name: "Entrance",
          type: "entrance",
          x: 400,
          y: 400,
          width: 150,
          height: 50,
          color: "#fafafa",
        },
      ],
    },
    office: {
      name: "Small Office Layout",
      rooms: [
        {
          id: "reception",
          name: "Reception",
          type: "entrance",
          x: 50,
          y: 50,
          width: 200,
          height: 100,
          color: "#fafafa",
        },
        { id: "office1", name: "Office 1", type: "office", x: 250, y: 50, width: 150, height: 150, color: "#f0f9ff" },
        { id: "office2", name: "Office 2", type: "office", x: 400, y: 50, width: 150, height: 150, color: "#f0fdf4" },
        {
          id: "meeting",
          name: "Meeting Room",
          type: "office",
          x: 50,
          y: 150,
          width: 200,
          height: 150,
          color: "#fef3c7",
        },
        { id: "kitchen", name: "Pantry", type: "kitchen", x: 250, y: 200, width: 100, height: 100, color: "#fdf2f8" },
        {
          id: "bathroom",
          name: "Restroom",
          type: "bathroom",
          x: 450,
          y: 200,
          width: 100,
          height: 100,
          color: "#f0f4ff",
        },
      ],
    },
    commercial: {
      name: "Retail Store",
      rooms: [
        { id: "entrance", name: "Entrance", type: "entrance", x: 50, y: 50, width: 150, height: 50, color: "#fafafa" },
        { id: "showroom", name: "Showroom", type: "living", x: 50, y: 100, width: 400, height: 250, color: "#f0f9ff" },
        { id: "storage", name: "Storage", type: "utility", x: 450, y: 100, width: 150, height: 150, color: "#f5f5f5" },
        {
          id: "office",
          name: "Manager Office",
          type: "office",
          x: 450,
          y: 250,
          width: 150,
          height: 100,
          color: "#f0fdf4",
        },
        { id: "bathroom", name: "Restroom", type: "bathroom", x: 200, y: 50, width: 100, height: 50, color: "#f0f4ff" },
      ],
    },
  }

  const loadSampleLayout = (layoutKey: keyof typeof sampleLayouts) => {
    setCurrentFloorPlan(sampleLayouts[layoutKey])
  }

  const parseCustomLayout = () => {
    try {
      const parsed = JSON.parse(customLayout)
      if (parsed.rooms && Array.isArray(parsed.rooms)) {
        setCurrentFloorPlan(parsed)
      } else {
        alert("Invalid floor plan format. Please check the JSON structure.")
      }
    } catch (error) {
      alert("Invalid JSON format. Please check your input.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Flexible Electrical Layout Generator</h1>
          <p className="text-lg text-gray-600 mb-6">
            Provide any floor plan layout and get automatic electrical wiring with intelligent component placement
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Quick Load Sample Layouts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(sampleLayouts).map(([key, layout]) => (
                  <button
                    key={key}
                    onClick={() => loadSampleLayout(key as keyof typeof sampleLayouts)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">{layout.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{layout.rooms.length} rooms</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Custom Floor Plan</h3>
              <textarea
                value={customLayout}
                onChange={(e) => setCustomLayout(e.target.value)}
                placeholder="Paste your floor plan JSON here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none text-sm"
              />
              <button
                onClick={parseCustomLayout}
                className="mt-2 w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Load Custom Layout
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Current Layout: {currentFloorPlan.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentFloorPlan.rooms.length}</div>
                <div className="text-sm text-gray-600">Total Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(currentFloorPlan.rooms.map((r) => r.type)).size}
                </div>
                <div className="text-sm text-gray-600">Room Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentFloorPlan.rooms.reduce((sum, r) => sum + r.width * r.height, 0) / 10000}
                </div>
                <div className="text-sm text-gray-600">Area (sq units)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">Auto</div>
                <div className="text-sm text-gray-600">Generation</div>
              </div>
            </div>
          </div>
        </div>

        <ElectricalGenerator floorPlan={currentFloorPlan} />

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Analyze Layout</h4>
              <p className="text-sm text-gray-600">
                System analyzes room types, sizes, and positions to determine optimal component placement
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Place Components</h4>
              <p className="text-sm text-gray-600">
                Automatically places switches, lights, sockets, and appliances based on electrical codes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Route Wiring</h4>
              <p className="text-sm text-gray-600">
                Generates optimized wire paths with minimal overlaps following building structure
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium mb-2">JSON Format Example:</h4>
          <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
            {`{
  "name": "My Floor Plan",
  "rooms": [
    {
      "id": "room1",
      "name": "Living Room", 
      "type": "living",
      "x": 50, "y": 50,
      "width": 300, "height": 200,
      "color": "#f0f9ff"
    }
  ]
}`}
          </pre>
          <p className="text-xs text-gray-600 mt-2">
            Supported room types: living, bedroom, kitchen, bathroom, utility, entrance, office, dining, corridor
          </p>
        </div>
      </div>
    </div>
  )
}
