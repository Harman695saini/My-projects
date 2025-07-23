"use client"

import { useState } from "react"
import { ImageUpload } from "./components/image-upload"
import { RoomAnnotator } from "./components/room-annotator"
import { ImageElectricalGenerator } from "./components/image-electrical-generator"
import type { ImageFloorPlan, AnnotatedRoom } from "./types/image-electrical-types"
import { FileImage, MapPin, Zap } from "lucide-react"

export default function ImageElectricalLayout() {
  const [currentStep, setCurrentStep] = useState<"upload" | "annotate" | "generate">("upload")
  const [floorPlan, setFloorPlan] = useState<ImageFloorPlan | null>(null)

  const handleImageUpload = (file: File, imageUrl: string) => {
    // Create image element to get dimensions
    const img = new Image()
    img.onload = () => {
      const newFloorPlan: ImageFloorPlan = {
        id: `plan_${Date.now()}`,
        name: file.name,
        imageUrl,
        imageWidth: img.width,
        imageHeight: img.height,
        scale: 100, // Default scale
        rooms: [],
      }
      setFloorPlan(newFloorPlan)
      setCurrentStep("annotate")
    }
    img.src = imageUrl
  }

  const handleClearImage = () => {
    if (floorPlan?.imageUrl) {
      URL.revokeObjectURL(floorPlan.imageUrl)
    }
    setFloorPlan(null)
    setCurrentStep("upload")
  }

  const handleRoomsUpdate = (rooms: AnnotatedRoom[]) => {
    if (floorPlan) {
      setFloorPlan({ ...floorPlan, rooms })
    }
  }

  const canProceedToGenerate = floorPlan && floorPlan.rooms.length > 0

  const steps = [
    { id: "upload", title: "Upload Floor Plan", icon: FileImage, completed: !!floorPlan },
    { id: "annotate", title: "Annotate Rooms", icon: MapPin, completed: canProceedToGenerate },
    { id: "generate", title: "Generate Electrical", icon: Zap, completed: false },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Image-Based Electrical Layout Generator</h1>
          <p className="text-lg text-gray-600 mb-6">
            Upload your floor plan image, annotate rooms, and automatically generate electrical wiring layout
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    currentStep === step.id
                      ? "border-blue-500 bg-blue-500 text-white"
                      : step.completed
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="ml-3 mr-8">
                  <div
                    className={`text-sm font-medium ${
                      currentStep === step.id ? "text-blue-600" : step.completed ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ${step.completed ? "bg-green-500" : "bg-gray-300"} mr-8`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {currentStep === "upload" && (
            <div className="space-y-6">
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImage={floorPlan?.imageUrl}
                onClearImage={handleClearImage}
              />

              {floorPlan && (
                <div className="text-center">
                  <button
                    onClick={() => setCurrentStep("annotate")}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
                  >
                    Proceed to Room Annotation
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === "annotate" && floorPlan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep("upload")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back to Upload
                </button>
                {canProceedToGenerate && (
                  <button
                    onClick={() => setCurrentStep("generate")}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    Generate Electrical Layout →
                  </button>
                )}
              </div>

              <RoomAnnotator
                imageUrl={floorPlan.imageUrl}
                imageWidth={floorPlan.imageWidth}
                imageHeight={floorPlan.imageHeight}
                rooms={floorPlan.rooms}
                onRoomsUpdate={handleRoomsUpdate}
              />
            </div>
          )}

          {currentStep === "generate" && floorPlan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep("annotate")}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back to Annotation
                </button>
              </div>

              <ImageElectricalGenerator floorPlan={floorPlan} />
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <FileImage className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">1. Upload Image</h4>
              </div>
              <p className="text-sm text-blue-800">
                Upload your floor plan image (PNG, JPG, PDF). The system supports various image formats and sizes.
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">2. Annotate Rooms</h4>
              </div>
              <p className="text-sm text-blue-800">
                Draw rectangles around each room and specify the room type (bedroom, kitchen, etc.) for accurate
                electrical placement.
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Zap className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">3. Generate Layout</h4>
              </div>
              <p className="text-sm text-blue-800">
                Automatically generate electrical components and wiring based on room types and electrical standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
