"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InputForm from "@/components/input-form"
import FloorPlanCanvas from "@/components/floor-plan-canvas"
import DesignSummary from "@/components/design-summary"
import { type FloorPlanData, generateFloorPlan } from "@/lib/floor-plan-generator"

export default function FloorLayoutGenerator() {
  const [floorPlan, setFloorPlan] = useState<FloorPlanData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("inputs")

  const handleGenerate = async (inputs: any) => {
    setIsGenerating(true)
    try {
      // Simulate processing time for complex calculations
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const generatedPlan = generateFloorPlan(inputs)
      setFloorPlan(generatedPlan)
      setActiveTab("preview") // Automatically switch to the preview tab
    } catch (error) {
      console.error("Error generating floor plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Professional Floor Layout Generator</h1>
          <p className="text-lg text-gray-600">
            Create optimized, practical, and beautiful floor plans with architectural intelligence.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="inputs">📝 Design Inputs</TabsTrigger>
            <TabsTrigger value="preview" disabled={!floorPlan}>
              🏠 Floor Plan Preview
            </TabsTrigger>
            <TabsTrigger value="summary" disabled={!floorPlan}>
              📊 Design Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inputs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🧠 Project Requirements & Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <InputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            {floorPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">🏗️ Generated Floor Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <FloorPlanCanvas floorPlan={floorPlan} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="summary">
            {floorPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">📋 Design Analysis & Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <DesignSummary floorPlan={floorPlan} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
