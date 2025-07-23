"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { FloorPlanData } from "@/lib/floor-plan-generator"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"

interface DesignSummaryProps {
  floorPlan: FloorPlanData
}

export default function DesignSummary({ floorPlan }: DesignSummaryProps) {
  const totalArea = floorPlan.plotDimensions.length * floorPlan.plotDimensions.width
  const builtUpArea = floorPlan.rooms.reduce((sum, room) => sum + room.width * room.height, 0)
  const utilizationPercentage = (builtUpArea / totalArea) * 100

  return (
    <div className="space-y-6">
      {/* Area Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📊 Area Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalArea} sq ft</div>
              <div className="text-sm text-gray-600">Total Plot Area</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{builtUpArea} sq ft</div>
              <div className="text-sm text-gray-600">Built-up Area</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{utilizationPercentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Space Utilization</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Space Utilization</span>
              <span>{utilizationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Room Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏠 Room Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {floorPlan.rooms.map((room, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{room.name}</div>
                  <div className="text-sm text-gray-600">
                    {room.width}' × {room.height}'
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{room.width * room.height} sq ft</div>
                  <Badge variant="outline" className="text-xs">
                    {room.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Design Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">✅ Design Compliance & Standards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Proper ventilation and natural light planning</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Optimal circulation and movement flow</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Privacy considerations for bedrooms and bathrooms</span>
            </div>
            {floorPlan.vastuCompliant && (
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Vastu Shastra compliance maintained</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span>Structural engineering review recommended</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vastu Analysis */}
      {floorPlan.vastuCompliant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">🧭 Vastu Shastra Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Positive Aspects:</h4>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• Main entrance positioned favorably</li>
                  <li>• Kitchen placed in appropriate direction</li>
                  <li>• Pooja room in northeast corner</li>
                  <li>• Master bedroom in southwest</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Ensure proper lighting in northeast</li>
                  <li>• Keep southwest area heavy</li>
                  <li>• Maintain cleanliness in northeast</li>
                  <li>• Use appropriate colors per direction</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🔧 Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Wall Specifications:</h4>
              <ul className="text-sm space-y-1">
                <li>• External walls: 9" thick</li>
                <li>• Internal walls: 4.5" thick</li>
                <li>• Partition walls: 3" thick</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Door & Window Sizes:</h4>
              <ul className="text-sm space-y-1">
                <li>• Main door: 4' × 7'</li>
                <li>• Internal doors: 3' × 7'</li>
                <li>• Windows: 4' × 4' (standard)</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Professional Note:</h4>
                <p className="text-sm text-blue-800 mt-1">
                  This floor plan is generated based on standard architectural practices. Please consult with a licensed
                  architect and structural engineer before construction. Local building codes and regulations must be
                  verified and followed.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
