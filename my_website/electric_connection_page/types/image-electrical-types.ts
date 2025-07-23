export interface ImageFloorPlan {
  id: string
  name: string
  imageUrl: string
  imageWidth: number
  imageHeight: number
  scale: number // pixels per meter
  rooms: AnnotatedRoom[]
}

export interface AnnotatedRoom {
  id: string
  name: string
  type: "living" | "bedroom" | "kitchen" | "bathroom" | "utility" | "entrance" | "office" | "dining" | "corridor"
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  color?: string
  isAnnotated: boolean
}

export interface ImageElectricalComponent {
  id: string
  type: "MDB" | "switch" | "light" | "fan" | "socket5A" | "socket15A" | "ac" | "geyser" | "washing" | "tv" | "exhaust"
  x: number
  y: number
  roomId: string
  label: string
  amperage?: number
  priority: number
}
