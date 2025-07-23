"use client"

import { Info, Plus, MousePointer } from "lucide-react"

interface RoomAnnotationHelperProps {
  roomCount: number
  isDrawing: boolean
  editingRoom: string | null
}

export function RoomAnnotationHelper({ roomCount, isDrawing, editingRoom }: RoomAnnotationHelperProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-2">Room Annotation Instructions</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              <span>Click and drag to draw rectangles around each room</span>
            </div>
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>You can add unlimited rooms - just keep drawing new rectangles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded border-2 border-white"></div>
              <span>Click on existing rooms to select/deselect them</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Use the trash icon to delete unwanted rooms</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium text-blue-900">Rooms Added: </span>
              <span className="text-blue-700">{roomCount}</span>
            </div>
            {isDrawing && (
              <div className="text-sm text-blue-700 animate-pulse">Drawing room... Release mouse to finish</div>
            )}
            {editingRoom && <div className="text-sm text-green-700">Fill in room details below to save</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
