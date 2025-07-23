"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Legend() {
  const legendItems = [
    {
      name: "Water Supply (Cold)",
      color: "#2563eb",
      width: 3,
      description: "Municipal/tank to fixtures",
      symbol: "━━━┬━━━",
    },
    {
      name: "Hot Water Supply",
      color: "#dc2626",
      width: 3,
      description: "From geyser to fixtures",
      symbol: "━━━┬━━━",
    },
    {
      name: "Main Distribution",
      color: "#1d4ed8",
      width: 6,
      description: "Primary water distribution",
      symbol: "━━━━━━",
    },
    {
      name: "Drainage Lines",
      color: "#16a34a",
      width: 4,
      description: "Waste water to main drain",
      symbol: "━━━►━━━",
    },
    {
      name: "Main Collection",
      color: "#059669",
      width: 6,
      description: "Primary drainage collection",
      symbol: "━━━►━━━",
    },
    {
      name: "Soil Pipe",
      color: "#1f2937",
      width: 8,
      description: "Main sewer connection",
      symbol: "━━━━━━",
    },
    {
      name: "Fixtures",
      color: "#0891b2",
      width: 8,
      description: "WC, basin, shower, etc.",
      symbol: "●",
    },
    {
      name: "Connection Points",
      color: "#1f2937",
      width: 6,
      description: "Pipe joints & fittings",
      symbol: "●",
    },
    {
      name: "Main Connections",
      color: "#2563eb",
      width: 12,
      description: "Water source, drain, sewer",
      symbol: "◉",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Enhanced Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 min-w-[60px]">
                <div
                  className="rounded-full"
                  style={{
                    backgroundColor: item.color,
                    width: `${Math.max(item.width, 4)}px`,
                    height: `${Math.max(item.width, 4)}px`,
                    minWidth: "8px",
                    minHeight: "8px",
                  }}
                />
                <span className="text-xs font-mono text-gray-500">{item.symbol}</span>
              </div>
              <div>
                <div className="text-xs font-medium">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-green-50 rounded text-xs">
          <strong>Connection Features:</strong>
          <div className="mt-1 space-y-1">
            <div>• Visible pipe connections at all joints</div>
            <div>• Flow direction arrows on drainage</div>
            <div>• Fixture-to-pipe connection indicators</div>
            <div>• Main distribution and collection lines</div>
            <div>• Enhanced labels and connection status</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
