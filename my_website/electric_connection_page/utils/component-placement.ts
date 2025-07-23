import type { Room, ElectricalComponent, ElectricalRules } from "../types/electrical-types"

export class ComponentPlacer {
  private getWallPositions(room: Room): Array<{ x: number; y: number; wall: "top" | "right" | "bottom" | "left" }> {
    const positions = []
    const margin = 20

    // Top wall
    positions.push({ x: room.x + margin, y: room.y + 10, wall: "top" })

    // Right wall
    positions.push({ x: room.x + room.width - 10, y: room.y + margin, wall: "right" })

    // Bottom wall
    positions.push({ x: room.x + margin, y: room.y + room.height - 10, wall: "bottom" })

    // Left wall
    positions.push({ x: room.x + 10, y: room.y + margin, wall: "left" })

    return positions
  }

  private getCeilingPositions(room: Room): Array<{ x: number; y: number }> {
    return [
      { x: room.x + room.width / 2, y: room.y + room.height / 2 },
      { x: room.x + room.width / 3, y: room.y + room.height / 3 },
      { x: room.x + (2 * room.width) / 3, y: room.y + (2 * room.height) / 3 },
    ]
  }

  private getCornerPositions(room: Room): Array<{ x: number; y: number }> {
    const margin = 15
    return [
      { x: room.x + margin, y: room.y + margin },
      { x: room.x + room.width - margin, y: room.y + margin },
      { x: room.x + room.width - margin, y: room.y + room.height - margin },
      { x: room.x + margin, y: room.y + room.height - margin },
    ]
  }

  placeComponents(rooms: Room[], rules: ElectricalRules): ElectricalComponent[] {
    const components: ElectricalComponent[] = []
    let componentId = 1

    for (const room of rooms) {
      const roomRules = rules[room.type]
      if (!roomRules) continue

      const wallPositions = this.getWallPositions(room)
      const ceilingPositions = this.getCeilingPositions(room)
      const cornerPositions = this.getCornerPositions(room)

      let wallIndex = 0
      let ceilingIndex = 0
      let cornerIndex = 0

      // Sort components by priority
      const sortedComponents = [...roomRules.components].sort((a, b) => a.priority - b.priority)

      for (const componentRule of sortedComponents) {
        for (let i = 0; i < componentRule.count; i++) {
          let position: { x: number; y: number }

          switch (componentRule.placement) {
            case "wall":
              if (wallIndex < wallPositions.length) {
                position = wallPositions[wallIndex]
                wallIndex++
              } else {
                position = wallPositions[0] // Fallback
              }
              break
            case "ceiling":
              if (ceilingIndex < ceilingPositions.length) {
                position = ceilingPositions[ceilingIndex]
                ceilingIndex++
              } else {
                position = ceilingPositions[0] // Fallback
              }
              break
            case "corner":
              if (cornerIndex < cornerPositions.length) {
                position = cornerPositions[cornerIndex]
                cornerIndex++
              } else {
                position = cornerPositions[0] // Fallback
              }
              break
            case "center":
              position = { x: room.x + room.width / 2, y: room.y + room.height / 2 }
              break
            default:
              position = wallPositions[0]
          }

          const component: ElectricalComponent = {
            id: `${componentRule.type}_${componentId++}`,
            type: componentRule.type,
            x: position.x,
            y: position.y,
            roomId: room.id,
            label: `${room.name} ${componentRule.type}`,
            amperage: componentRule.amperage,
            priority: componentRule.priority,
          }

          components.push(component)
        }
      }
    }

    return components
  }
}
