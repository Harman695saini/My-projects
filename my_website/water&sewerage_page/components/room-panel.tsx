"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Zap } from "lucide-react"

interface RoomPanelProps {
  rooms: any[]
  onRoomUpdate: (rooms: any[]) => void
  onGeneratePlumbing: (room: any) => void
}

export default function RoomPanel({ rooms, onRoomUpdate, onGeneratePlumbing }: RoomPanelProps) {
  const getRoomColor = (roomType: string) => {
    const colors = {
      bathroom: "#3b82f6",
      kitchen: "#f59e0b",
      utility: "#10b981",
      "powder-room": "#8b5cf6",
    }
    return colors[roomType as keyof typeof colors] || "#6b7280"
  }

  const deleteRoom = (roomId: string) => {
    onRoomUpdate(rooms.filter((room) => room.id !== roomId))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Detected Rooms ({rooms.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rooms.length === 0 ? (
          <p className="text-sm text-gray-500">No rooms selected yet</p>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: getRoomColor(room.type) }} />
                <div>
                  <div className="text-sm font-medium">{room.label}</div>
                  <div className="text-xs text-gray-500">
                    {Math.round(room.bounds.width)} × {Math.round(room.bounds.height)}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => onGeneratePlumbing(room)} className="h-6 w-6 p-0">
                  <Zap className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteRoom(room.id)} className="h-6 w-6 p-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}

        {rooms.length > 0 && (
          <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
            <strong>Room Types:</strong>
            <div className="mt-1 space-y-1">
              <div>• Bathroom: WC, Basin, Shower</div>
              <div>• Kitchen: Sink, Grease Trap</div>
              <div>• Utility: Washing Machine</div>
              <div>• Powder Room: WC, Basin</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
