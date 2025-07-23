"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calculator, Home, Layers } from "lucide-react"

export default function Component() {
  const [plotSize, setPlotSize] = useState(1000)
  const [floors, setFloors] = useState(1)
  const [showCosts, setShowCosts] = useState(false)
  const [rates, setRates] = useState({
    cement: 360, // per bag (50kg)
    sand: 2300, // per ton (average ₹1,600-3,000)
    aggregate: 1500, // per ton
    steel: 65, // per kg (average ₹60-74)
    paint: 65, // per liter (average interior ₹50/L, exterior ₹80/L)
    bricks: 9, // per piece (average ₹8-10)
    flooring: 75, // per sqft (variable ₹50-200, keeping moderate default)
  })

  // Base quantities for 1000 sqft
  const baseQuantities = {
    cement: 400, // bags
    sand: 816, // tons
    aggregate: 608, // tons
    steel: 4000, // kg
    paint: 180, // liters
    bricks: 8000, // nos
    flooring: 1300, // sqft
  }

  const [calculatedQuantities, setCalculatedQuantities] = useState(baseQuantities)
  const [totalCost, setTotalCost] = useState(0)

  useEffect(() => {
    const multiplier = (plotSize / 1000) * floors
    const newQuantities = {
      cement: Math.round(baseQuantities.cement * multiplier),
      sand: Math.round(baseQuantities.sand * multiplier * 100) / 100,
      aggregate: Math.round(baseQuantities.aggregate * multiplier * 100) / 100,
      steel: Math.round(baseQuantities.steel * multiplier),
      paint: Math.round(baseQuantities.paint * multiplier),
      bricks: Math.round(baseQuantities.bricks * multiplier),
      flooring: Math.round(baseQuantities.flooring * multiplier),
    }
    setCalculatedQuantities(newQuantities)

    // Calculate total cost
    const cost =
      newQuantities.cement * rates.cement +
      newQuantities.sand * rates.sand +
      newQuantities.aggregate * rates.aggregate +
      newQuantities.steel * rates.steel +
      newQuantities.paint * rates.paint +
      newQuantities.bricks * rates.bricks +
      newQuantities.flooring * rates.flooring

    setTotalCost(cost)
  }, [plotSize, floors, rates])

  const handleRateChange = (material: string, value: string) => {
    setRates((prev) => ({
      ...prev,
      [material]: Number.parseFloat(value) || 0,
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">House Construction Cost Calculator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calculate building material quantities and estimated costs for your house construction project. Based on
            standard requirements for residential construction.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Project Details
                </CardTitle>
                <CardDescription>Enter your construction specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plotSize">Plot Size (sq ft)</Label>
                  <Input
                    id="plotSize"
                    type="number"
                    value={plotSize}
                    onChange={(e) => setPlotSize(Number.parseInt(e.target.value) || 1000)}
                    min="100"
                    max="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floors">Number of Floors</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={floors}
                    onChange={(e) => setFloors(Number.parseInt(e.target.value) || 1)}
                    min="1"
                    max="5"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowCosts(!showCosts)} className="w-full">
                  {showCosts ? "Hide" : "Show"} Cost Estimation
                </Button>
              </CardContent>
            </Card>

            {showCosts && (
              <Card>
                <CardHeader>
                  <CardTitle>Material Rates</CardTitle>
                  <CardDescription>Current market rates (2024) - Update as per your local market</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Cement (₹/bag) - 50kg</Label>
                    <Input
                      type="number"
                      value={rates.cement}
                      onChange={(e) => handleRateChange("cement", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Sand (₹/ton) - Range: ₹1,600-3,000</Label>
                    <Input
                      type="number"
                      value={rates.sand}
                      onChange={(e) => handleRateChange("sand", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Aggregate (₹/ton)</Label>
                    <Input
                      type="number"
                      value={rates.aggregate}
                      onChange={(e) => handleRateChange("aggregate", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Steel TMT (₹/kg) - Range: ₹60-74</Label>
                    <Input
                      type="number"
                      value={rates.steel}
                      onChange={(e) => handleRateChange("steel", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Paint (₹/liter) - Interior: ₹50, Exterior: ₹80</Label>
                    <Input
                      type="number"
                      value={rates.paint}
                      onChange={(e) => handleRateChange("paint", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Bricks (₹/piece) - Range: ₹8-10</Label>
                    <Input
                      type="number"
                      value={rates.bricks}
                      onChange={(e) => handleRateChange("bricks", e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 items-center">
                    <Label className="text-sm">Flooring (₹/sqft)</Label>
                    <Input
                      type="number"
                      value={rates.flooring}
                      onChange={(e) => handleRateChange("flooring", e.target.value)}
                      className="h-8"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Material Quantities Required
                </CardTitle>
                <CardDescription>
                  Calculated for {plotSize.toLocaleString()} sq ft × {floors} floor{floors > 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Cement */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Cement</h3>
                      <p className="text-2xl font-bold text-blue-600">{calculatedQuantities.cement.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Bags (50kg each)</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.cement * rates.cement)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.cement}/bag</p>
                      </div>
                    )}
                  </div>

                  {/* Sand */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Sand</h3>
                      <p className="text-2xl font-bold text-yellow-600">{calculatedQuantities.sand.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Tons</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.sand * rates.sand)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.sand}/ton</p>
                      </div>
                    )}
                  </div>

                  {/* Aggregate */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Aggregate</h3>
                      <p className="text-2xl font-bold text-gray-600">
                        {calculatedQuantities.aggregate.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Tons</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.aggregate * rates.aggregate)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.aggregate}/ton</p>
                      </div>
                    )}
                  </div>

                  {/* Steel */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Steel</h3>
                      <p className="text-2xl font-bold text-red-600">{calculatedQuantities.steel.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Kg</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.steel * rates.steel)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.steel}/kg</p>
                      </div>
                    )}
                  </div>

                  {/* Paint */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Paint</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {calculatedQuantities.paint.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Liters</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.paint * rates.paint)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.paint}/liter</p>
                      </div>
                    )}
                  </div>

                  {/* Bricks */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Bricks</h3>
                      <p className="text-2xl font-bold text-orange-600">
                        {calculatedQuantities.bricks.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Numbers</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.bricks * rates.bricks)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.bricks}/piece</p>
                      </div>
                    )}
                  </div>

                  {/* Flooring */}
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Flooring</h3>
                      <p className="text-2xl font-bold text-teal-600">
                        {calculatedQuantities.flooring.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Sq Ft</p>
                    </div>
                    {showCosts && (
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(calculatedQuantities.flooring * rates.flooring)}
                        </p>
                        <p className="text-xs text-gray-500">@ ₹{rates.flooring}/sqft</p>
                      </div>
                    )}
                  </div>
                </div>

                {showCosts && (
                  <>
                    <Separator className="my-6" />
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Total Estimated Cost</h3>
                          <p className="text-sm text-gray-600">Material cost only (excluding labor & other expenses)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCost)}</p>
                          <p className="text-sm text-gray-600">₹{Math.round(totalCost / plotSize)}/sq ft</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {showCosts && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Cost Breakdown (Per 1,000 sq ft reference)</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Cement (400 bags):</span>
                        <span className="font-medium">₹{(400 * rates.cement).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Steel (4,000 kg):</span>
                        <span className="font-medium">₹{(4000 * rates.steel).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Sand (816 tons):</span>
                        <span className="font-medium">₹{(816 * rates.sand).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Aggregate (608 tons):</span>
                        <span className="font-medium">₹{(608 * rates.aggregate).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Bricks (8,000 pcs):</span>
                        <span className="font-medium">₹{(8000 * rates.bricks).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Paint (180 L):</span>
                        <span className="font-medium">₹{(180 * rates.paint).toLocaleString()}</span>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-blue-800">
                      <span>Total per 1,000 sq ft:</span>
                      <span>
                        ₹
                        {(
                          400 * rates.cement +
                          4000 * rates.steel +
                          816 * rates.sand +
                          608 * rates.aggregate +
                          8000 * rates.bricks +
                          180 * rates.paint
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• These are approximate quantities based on standard construction practices</li>
                    <li>• Actual requirements may vary based on design, soil conditions, and construction methods</li>
                    <li>• Add 5-10% extra material for wastage and contingency</li>
                    <li>• Costs shown are for materials only and do not include labor, equipment, or other expenses</li>
                    <li>• Consult with a structural engineer for accurate requirements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
