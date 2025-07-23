"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { AnnotatedRoom } from "../types/image-electrical-types"
import { Trash2, Save } from "lucide-react"
import { RoomAnnotationHelper } from "./room-annotation-helper"

interface RoomAnnotatorProps {
  imageUrl: string
  imageWidth: number
  imageHeight: number
  rooms: AnnotatedRoom[]
  onRoomsUpdate: (rooms: AnnotatedRoom[]) => void
}

export function RoomAnnotator({ imageUrl, imageWidth, imageHeight, rooms, onRoomsUpdate }: RoomAnnotatorProps) {
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Partial<AnnotatedRoom> | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [roomForm, setRoomForm] = useState({ name: "", type: "living" as const })
  const svgRef = useRef<SVGSVGElement>(null)

  const roomTypes = [
    { value: "living", label: "Living Room", color: "#f0f9ff" },
    { value: "bedroom", label: "Bedroom", color: "#f0fdf4" },
    { value: "kitchen", label: "Kitchen", color: "#fef3c7" },
    { value: "bathroom", label: "Bathroom", color: "#f0f4ff" },
    { value: "utility", label: "Utility", color: "#f5f5f5" },
    { value: "entrance", label: "Entrance", color: "#fafafa" },
    { value: "office", label: "Office", color: "#fdf2f8" },
    { value: "dining", label: "Dining", color: "#f0fdfa" },
    { value: "corridor", label: "Corridor", color: "#f9fafb" },
  ]

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (editingRoom) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    // Get coordinates relative to the SVG element
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setCurrentRoom({
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bounds: { x, y, width: 0, height: 0 },
      isAnnotated: false,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentRoom) return

    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    // Get coordinates relative to the SVG element
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const startX = currentRoom.bounds!.x
    const startY = currentRoom.bounds!.y

    setCurrentRoom({
      ...currentRoom,
      bounds: {
        x: Math.min(startX, x),
        y: Math.min(startY, y),
        width: Math.abs(x - startX),
        height: Math.abs(y - startY),
      },
    })
  }

  const handleMouseUp = () => {
    if (!isDrawing || !currentRoom) return

    setIsDrawing(false)

    // Only add room if it has meaningful size (reduced threshold)
    if (currentRoom.bounds!.width > 10 && currentRoom.bounds!.height > 10) {
      setEditingRoom(currentRoom.id!)
      setRoomForm({ name: "", type: "living" })
    } else {
      setCurrentRoom(null)
    }
  }

  const saveRoom = () => {
    if (!currentRoom || !roomForm.name) return

    const roomType = roomTypes.find((t) => t.value === roomForm.type)
    const newRoom: AnnotatedRoom = {
      id: currentRoom.id!,
      name: roomForm.name,
      type: roomForm.type,
      bounds: currentRoom.bounds!,
      color: roomType?.color,
      isAnnotated: true,
    }

    onRoomsUpdate([...rooms, newRoom])
    setCurrentRoom(null)
    setEditingRoom(null)
    setRoomForm({ name: "", type: "living" })
  }

  const deleteRoom = (roomId: string) => {
    onRoomsUpdate(rooms.filter((r) => r.id !== roomId))
    setSelectedRoom(null)
  }

  const selectRoom = (roomId: string) => {
    setSelectedRoom(selectedRoom === roomId ? null : roomId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Annotate Rooms</h3>
        <div className="text-sm text-gray-600">Draw rectangles around rooms to annotate them</div>
      </div>

      <RoomAnnotationHelper roomCount={rooms.length} isDrawing={isDrawing} editingRoom={editingRoom} />

      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Floor plan"
          className="w-full h-auto max-h-[600px] object-contain"
          draggable={false}
        />

        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ pointerEvents: editingRoom ? "none" : "all" }}
        >
          {/* Existing rooms */}
          {rooms.map((room) => (
            <g key={room.id}>
              <rect
                x={room.bounds.x}
                y={room.bounds.y}
                width={room.bounds.width}
                height={room.bounds.height}
                fill={room.color || "#f0f9ff"}
                fillOpacity="0.3"
                stroke={selectedRoom === room.id ? "#3b82f6" : "#6b7280"}
                strokeWidth={selectedRoom === room.id ? "3" : "2"}
                strokeDasharray="5,5"
                className="cursor-pointer"
                onClick={() => selectRoom(room.id)}
              />
              <text
                x={room.bounds.x + room.bounds.width / 2}
                y={room.bounds.y + room.bounds.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium fill-gray-700 pointer-events-none"
              >
                {room.name}
              </text>
              <text
                x={room.bounds.x + room.bounds.width / 2}
                y={room.bounds.y + room.bounds.height / 2 + 15}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-gray-600 pointer-events-none"
              >
                {roomTypes.find((t) => t.value === room.type)?.label}
              </text>
            </g>
          ))}

          {/* Current drawing room */}
          {currentRoom && currentRoom.bounds && (
            <rect
              x={currentRoom.bounds.x}
              y={currentRoom.bounds.y}
              width={currentRoom.bounds.width}
              height={currentRoom.bounds.height}
              fill="#3b82f6"
              fillOpacity="0.2"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          )}
        </svg>
      </div>

      {/* Room editing form */}
      {editingRoom && (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-sm">
          <h4 className="font-medium mb-3">Add Room Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
              <input
                type="text"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                placeholder="e.g., Master Bedroom"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={saveRoom}
              disabled={!roomForm.name}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Room
            </button>
            <button
              onClick={() => {
                setCurrentRoom(null)
                setEditingRoom(null)
                setRoomForm({ name: "", type: "living" })
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Room list */}
      {rooms.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Annotated Rooms ({rooms.length})</h4>
            <div className="text-sm text-gray-600">
              Click rooms to select/deselect • Draw new rectangles to add more rooms
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-3 bg-white rounded border cursor-pointer transition-colors ${
                  selectedRoom === room.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => selectRoom(room.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{room.name}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {roomTypes.find((t) => t.value === room.type)?.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(room.bounds.width)}×{Math.round(room.bounds.height)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteRoom(room.id)
                    }}
                    className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
