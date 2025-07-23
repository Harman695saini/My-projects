import type { ElectricalComponent, WireConnection, Room } from "../types/electrical-types"

export class WireRouter {
  private rooms: Room[]
  private components: ElectricalComponent[]

  constructor(rooms: Room[], components: ElectricalComponent[]) {
    this.rooms = rooms
    this.components = components
  }

  private findMDB(): ElectricalComponent | null {
    return this.components.find((c) => c.type === "MDB") || null
  }

  private isPointInRoom(x: number, y: number, room: Room): boolean {
    return x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height
  }

  private findPath(from: ElectricalComponent, to: ElectricalComponent): string {
    // Simple pathfinding that follows walls and corridors
    const startX = from.x
    const startY = from.y
    const endX = to.x
    const endY = to.y

    // Find a common corridor or wall path
    const midY = Math.min(startY, endY) - 20 // Route above rooms when possible

    // Create path that follows building structure
    if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
      // Horizontal routing preferred
      return `M${startX},${startY} L${startX},${midY} L${endX},${midY} L${endX},${endY}`
    } else {
      // Vertical routing preferred
      const midX = Math.min(startX, endX) - 20
      return `M${startX},${startY} L${midX},${startY} L${midX},${endY} L${endX},${endY}`
    }
  }

  private optimizePath(path: string, components: ElectricalComponent[]): string {
    // Simple path optimization to reduce overlaps
    // In a real implementation, this would use more sophisticated algorithms
    return path
  }

  generateConnections(): WireConnection[] {
    const connections: WireConnection[] = []
    const mdb = this.findMDB()

    if (!mdb) {
      console.warn("No MDB found, cannot generate connections")
      return connections
    }

    let connectionId = 1

    // Group components by room for efficient routing
    const componentsByRoom = new Map<string, ElectricalComponent[]>()

    for (const component of this.components) {
      if (component.type === "MDB") continue

      if (!componentsByRoom.has(component.roomId)) {
        componentsByRoom.set(component.roomId, [])
      }
      componentsByRoom.get(component.roomId)!.push(component)
    }

    // Create connections from MDB to each room's main switch first
    for (const [roomId, roomComponents] of componentsByRoom) {
      const switches = roomComponents.filter((c) => c.type === "switch")

      for (const switchComp of switches) {
        const connection: WireConnection = {
          id: `conn_${connectionId++}`,
          from: mdb.id,
          to: switchComp.id,
          path: this.findPath(mdb, switchComp),
          type: "power",
          amperage: 20, // Main power line
        }
        connections.push(connection)

        // Connect switch to lights and fans in the same room
        const controllableComponents = roomComponents.filter(
          (c) => c.type === "light" || c.type === "fan" || c.type === "exhaust",
        )

        for (const controlled of controllableComponents) {
          const controlConnection: WireConnection = {
            id: `conn_${connectionId++}`,
            from: switchComp.id,
            to: controlled.id,
            path: this.findPath(switchComp, controlled),
            type: "control",
            amperage: controlled.amperage || 5,
          }
          connections.push(controlConnection)
        }
      }

      // Direct connections from MDB for high-power appliances
      const directComponents = roomComponents.filter(
        (c) =>
          c.type === "socket15A" ||
          c.type === "ac" ||
          c.type === "geyser" ||
          c.type === "washing" ||
          c.type === "socket5A" ||
          c.type === "tv",
      )

      for (const direct of directComponents) {
        const directConnection: WireConnection = {
          id: `conn_${connectionId++}`,
          from: mdb.id,
          to: direct.id,
          path: this.findPath(mdb, direct),
          type: "power",
          amperage: direct.amperage || 5,
        }
        connections.push(directConnection)
      }
    }

    return connections
  }
}
