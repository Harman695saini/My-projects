export interface Room {
  id: string
  name: string
  type: "living" | "bedroom" | "kitchen" | "bathroom" | "utility" | "entrance" | "office" | "dining" | "corridor"
  x: number
  y: number
  width: number
  height: number
  color?: string
}

export interface Wall {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  roomId?: string
}

export interface ElectricalComponent {
  id: string
  type: "MDB" | "switch" | "light" | "fan" | "socket5A" | "socket15A" | "ac" | "geyser" | "washing" | "tv" | "exhaust"
  x: number
  y: number
  roomId: string
  label: string
  amperage?: number
  priority: number
}

export interface WireConnection {
  id: string
  from: string
  to: string
  path: string
  type: "power" | "control"
  amperage: number
}

export interface FloorPlan {
  rooms: Room[]
  walls?: Wall[]
  scale?: number
  name?: string
}

export interface ElectricalRules {
  [roomType: string]: {
    components: Array<{
      type: ElectricalComponent["type"]
      count: number
      placement: "wall" | "ceiling" | "corner" | "center"
      priority: number
      amperage?: number
    }>
  }
}
