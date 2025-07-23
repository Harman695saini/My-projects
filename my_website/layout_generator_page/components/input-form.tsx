"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface InputFormProps {
  onGenerate: (inputs: any) => void
  isGenerating: boolean
}

export default function InputForm({ onGenerate, isGenerating }: InputFormProps) {
  const [inputs, setInputs] = useState({
    // Plot Details
    plotLength: "",
    plotWidth: "",
    facingDirection: "",

    // Room Requirements
    bedrooms: "2",
    bathrooms: "2",

    // Parking & Stairs
    carParking: false,
    bikeParking: false,
    staircaseType: "internal",

    // Special Rooms
    poojaRoom: false,
    storeRoom: false,
    studyRoom: false,
    utilityRoom: false,

    // User Preferences
    openKitchen: false,
    separateDining: false,

    // Vastu Preferences
    vastuCompliance: false,

    // Additional Requirements
    specialRequirements: "",
  })

  const handleInputChange = (field: string, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(inputs)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Plot Specifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📐 Plot Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plotLength">Plot Length (feet)</Label>
              <Input
                id="plotLength"
                type="number"
                placeholder="e.g., 40"
                value={inputs.plotLength}
                onChange={(e) => handleInputChange("plotLength", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="plotWidth">Plot Width (feet)</Label>
              <Input
                id="plotWidth"
                type="number"
                placeholder="e.g., 30"
                value={inputs.plotWidth}
                onChange={(e) => handleInputChange("plotWidth", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="facingDirection">Facing Direction</Label>
            <Select
              value={inputs.facingDirection}
              onValueChange={(value) => handleInputChange("facingDirection", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select facing direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="north">🧭 North</SelectItem>
                <SelectItem value="south">🧭 South</SelectItem>
                <SelectItem value="east">🧭 East</SelectItem>
                <SelectItem value="west">🧭 West</SelectItem>
                <SelectItem value="northeast">🧭 North-East</SelectItem>
                <SelectItem value="northwest">🧭 North-West</SelectItem>
                <SelectItem value="southeast">🧭 South-East</SelectItem>
                <SelectItem value="southwest">🧭 South-West</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏠 Room Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bedrooms">Number of Bedrooms</Label>
              <Select value={inputs.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bathrooms">Number of Bathrooms</Label>
              <Select value={inputs.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bathroom</SelectItem>
                  <SelectItem value="2">2 Bathrooms</SelectItem>
                  <SelectItem value="3">3 Bathrooms</SelectItem>
                  <SelectItem value="4">4+ Bathrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parking & Circulation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🚗 Parking & Circulation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="carParking"
              checked={inputs.carParking}
              onCheckedChange={(checked) => handleInputChange("carParking", checked)}
            />
            <Label htmlFor="carParking">Car Parking Required</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="bikeParking"
              checked={inputs.bikeParking}
              onCheckedChange={(checked) => handleInputChange("bikeParking", checked)}
            />
            <Label htmlFor="bikeParking">Bike Parking Required</Label>
          </div>

          <div>
            <Label htmlFor="staircaseType">Staircase Placement</Label>
            <Select value={inputs.staircaseType} onValueChange={(value) => handleInputChange("staircaseType", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal Staircase</SelectItem>
                <SelectItem value="external">External Staircase</SelectItem>
                <SelectItem value="none">No Staircase (Single Floor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Special Rooms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏛️ Special Rooms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="poojaRoom"
                checked={inputs.poojaRoom}
                onCheckedChange={(checked) => handleInputChange("poojaRoom", checked)}
              />
              <Label htmlFor="poojaRoom">Pooja Room</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="storeRoom"
                checked={inputs.storeRoom}
                onCheckedChange={(checked) => handleInputChange("storeRoom", checked)}
              />
              <Label htmlFor="storeRoom">Store Room</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="studyRoom"
                checked={inputs.studyRoom}
                onCheckedChange={(checked) => handleInputChange("studyRoom", checked)}
              />
              <Label htmlFor="studyRoom">Study Room</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="utilityRoom"
                checked={inputs.utilityRoom}
                onCheckedChange={(checked) => handleInputChange("utilityRoom", checked)}
              />
              <Label htmlFor="utilityRoom">Utility Room</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚙️ Design Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="openKitchen"
              checked={inputs.openKitchen}
              onCheckedChange={(checked) => handleInputChange("openKitchen", checked)}
            />
            <Label htmlFor="openKitchen">Open Kitchen Design</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="separateDining"
              checked={inputs.separateDining}
              onCheckedChange={(checked) => handleInputChange("separateDining", checked)}
            />
            <Label htmlFor="separateDining">Separate Dining Area</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vastuCompliance"
              checked={inputs.vastuCompliance}
              onCheckedChange={(checked) => handleInputChange("vastuCompliance", checked)}
            />
            <Label htmlFor="vastuCompliance">Vastu Compliance Required</Label>
          </div>
        </CardContent>
      </Card>

      {/* Additional Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Additional Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="specialRequirements">Special Requirements or Notes</Label>
          <Textarea
            id="specialRequirements"
            placeholder="Any specific requirements, preferences, or constraints..."
            value={inputs.specialRequirements}
            onChange={(e) => handleInputChange("specialRequirements", e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full h-12 text-lg"
        disabled={isGenerating || !inputs.plotLength || !inputs.plotWidth || !inputs.facingDirection}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating Floor Plan...
          </>
        ) : (
          "🏗️ Generate Professional Floor Plan"
        )}
      </Button>
    </form>
  )
}
