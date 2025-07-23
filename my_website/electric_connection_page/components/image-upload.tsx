"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (file: File, imageUrl: string) => void
  currentImage?: string
  onClearImage?: () => void
}

export function ImageUpload({ onImageUpload, currentImage, onClearImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file)
      onImageUpload(file, imageUrl)
    } else {
      alert("Please upload an image file (PNG, JPG, etc.)")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (currentImage) {
    return (
      <div className="relative">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-900">Floor plan uploaded successfully</p>
              <p className="text-sm text-green-700">Ready for room annotation and electrical generation</p>
            </div>
          </div>
          <button onClick={onClearImage} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"}
        `}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Floor Plan</h3>
        <p className="text-gray-600 mb-4">Drag and drop your floor plan image here, or click to browse</p>
        <p className="text-sm text-gray-500">Supports PNG, JPG, PDF, and other image formats</p>
      </div>
    </div>
  )
}
