export interface Room {
  name: string
  type: string
  x: number
  y: number
  width: number
  height: number
}

export interface Door {
  x: number
  y: number
  width: number
  height: number
  orientation: "horizontal" | "vertical"
}

export interface Window {
  x: number
  y: number
  width: number
  height: number
  orientation: "horizontal" | "vertical"
}

export interface FloorPlanData {
  plotDimensions: {
    length: number
    width: number
  }
  facingDirection: string
  rooms: Room[]
  doors: Door[]
  windows: Window[]
  vastuCompliant: boolean
  staircase?: {
    x: number
    y: number
    width: number
    height: number
    direction: "up" | "down"
  }
  openConcept: boolean
}

// --- CORE DESIGN ENGINE ---
export function generateFloorPlan(inputs: any): FloorPlanData {
  const plotLength = Number(inputs.plotLength)
  const plotWidth = Number(inputs.plotWidth)
  const setback = 3
  const buildableLength = plotLength - setback * 2
  const buildableWidth = plotWidth - setback * 2

  // 1. Define Zones (The core of architectural design)
  const zones = defineArchitecturalZones(buildableLength, buildableWidth, setback, inputs)

  // 2. Place Rooms within their designated zones using RATIO-BASED allocation
  let placedRooms = placeRoomsInZonesByRatio(zones, inputs)

  // 3. Create Circulation (Hallways) & Maximize Space
  const { roomsWithCorridor, corridor } = createEfficientCirculation(placedRooms, zones)
  if (corridor) {
    placedRooms = roomsWithCorridor
    placedRooms.push(corridor)
  }

  // 4. Generate Doors & Windows with practical logic
  const { doors, windows } = generateDoorsAndWindows(placedRooms, inputs, {
    plotLength,
    plotWidth,
    setback,
  })

  // 5. Finalize Plan Data
  const planData: FloorPlanData = {
    plotDimensions: { length: plotLength, width: plotWidth },
    facingDirection: inputs.facingDirection,
    rooms: placedRooms,
    doors,
    windows,
    vastuCompliant: inputs.vastuCompliance,
    openConcept: inputs.openKitchen,
  }

  // Add staircase if needed
  if (inputs.staircaseType !== "none") {
    const livingRoom = placedRooms.find((r) => r.type === "living")
    if (livingRoom) {
      planData.staircase = {
        x: livingRoom.x + 1,
        y: livingRoom.y + livingRoom.height - 11,
        width: 4,
        height: 10,
        direction: "up",
      }
    }
  }

  return planData
}

// --- ARCHITECTURAL SUB-SYSTEMS ---

function defineArchitecturalZones(length: number, width: number, setback: number, inputs: any) {
  const publicDepth = width * 0.5
  const privateDepth = width * 0.5

  const zones = {
    public: { x: setback, y: setback, width: length, height: publicDepth },
    private: { x: setback, y: setback + publicDepth, width: length, height: privateDepth },
  }
  return zones
}

function placeRoomsInZonesByRatio(zones: any, inputs: any): Room[] {
  const rooms: Room[] = []
  const { public: publicZone, private: privateZone } = zones

  // --- Define Room Ratios ---
  const roomRatios = {
    living: 5,
    kitchen: 3,
    masterBedroom: 4,
    bedroom: 3,
    bathroom: 1.5,
    pooja: 1,
    store: 1,
  }

  // --- Public Zone Allocation ---
  const publicRoomRequirements = [{ type: "living", ratio: roomRatios.living }]
  if (!inputs.openKitchen) {
    publicRoomRequirements.push({ type: "kitchen", ratio: roomRatios.kitchen })
  } else {
    // In open concept, kitchen is part of living, but we still need its object
    const kitchenRatio = roomRatios.kitchen
    const livingRatio = roomRatios.living
    const totalRatio = kitchenRatio + livingRatio
    const kitchenWidth = (publicZone.width * kitchenRatio) / totalRatio
    const livingWidth = (publicZone.width * livingRatio) / totalRatio

    rooms.push({
      name: "Living / Dining",
      type: "living",
      x: publicZone.x,
      y: publicZone.y,
      width: livingWidth,
      height: publicZone.height,
    })
    rooms.push({
      name: "Kitchen",
      type: "kitchen",
      x: publicZone.x + livingWidth,
      y: publicZone.y,
      width: kitchenWidth,
      height: publicZone.height * 0.7, // Kitchen doesn't always need full depth
    })
  }

  // --- Private Zone Allocation ---
  const privateRoomRequirements = []
  for (let i = 0; i < Number(inputs.bedrooms); i++) {
    privateRoomRequirements.push({
      type: i === 0 ? "masterBedroom" : "bedroom",
      ratio: i === 0 ? roomRatios.masterBedroom : roomRatios.bedroom,
    })
  }
  // We will handle bathrooms by carving them out of bedroom spaces for en-suite logic

  const totalPrivateRatio = privateRoomRequirements.reduce((sum, req) => sum + req.ratio, 0)
  let currentX = privateZone.x

  privateRoomRequirements.forEach((req) => {
    const roomWidth = (privateZone.width * req.ratio) / totalPrivateRatio
    rooms.push({
      name: req.type === "masterBedroom" ? "Master Bedroom" : `Bedroom ${privateRoomRequirements.indexOf(req)}`,
      type: "bedroom",
      x: currentX,
      y: privateZone.y,
      width: roomWidth,
      height: privateZone.height,
    })
    currentX += roomWidth
  })

  // --- Bathroom Placement (Carve-out method) ---
  const masterBed = rooms.find((r) => r.name === "Master Bedroom")
  let enSuitePlaced = false
  if (masterBed && Number(inputs.bathrooms) > 0) {
    const bathWidth = 6
    const minBedroomWidthAfterCarve = 8
    if (masterBed.width >= bathWidth + minBedroomWidthAfterCarve) {
      const bathHeight = Math.min(8, masterBed.height)
      rooms.push({
        name: "Master Bathroom",
        type: "bathroom",
        x: masterBed.x,
        y: masterBed.y,
        width: bathWidth,
        height: bathHeight,
      })
      masterBed.x += bathWidth
      masterBed.width -= bathWidth
      enSuitePlaced = true
    }
  }

  const bathroomsToPlace = Number(inputs.bathrooms) - (enSuitePlaced ? 1 : 0)
  if (bathroomsToPlace > 0) {
    const kitchen = rooms.find((r) => r.type === "kitchen")!
    rooms.push({
      name: "Common Bathroom",
      type: "bathroom",
      x: kitchen.x,
      y: kitchen.y + kitchen.height,
      width: 6,
      height: 8,
    })
  }

  return rooms
}

function createEfficientCirculation(rooms: Room[], zones: any) {
  const corridorWidth = 4
  const privateRooms = rooms.filter((r) => r.type === "bedroom" || r.name.includes("Bathroom"))
  if (privateRooms.length === 0) return { roomsWithCorridor: rooms, corridor: null }

  const corridorY = zones.private.y - corridorWidth
  const corridor: Room = {
    name: "Corridor",
    type: "corridor",
    x: zones.private.x,
    y: corridorY,
    width: zones.private.width,
    height: corridorWidth,
  }

  const publicRooms = rooms.filter((r) => r.type === "living" || r.type === "kitchen")
  publicRooms.forEach((room) => {
    if (room.y + room.height > corridorY) {
      room.height = corridorY - room.y
    }
  })

  privateRooms.forEach((room) => {
    const originalY = room.y
    const originalHeight = room.height
    room.y = corridor.y + corridor.height
    // Adjust height only if it was in the private zone to begin with
    if (originalY >= zones.private.y) {
      room.height = zones.private.y + zones.private.height - room.y
    }
  })

  return { roomsWithCorridor: rooms, corridor }
}

function generateDoorsAndWindows(rooms: Room[], inputs: any, plotInfo: any) {
  const doors: Door[] = []
  const windows: Window[] = []
  const { plotLength, plotWidth, setback } = plotInfo

  const living = rooms.find((r) => r.type === "living")!
  doors.push({
    x: living.x + living.width / 2,
    y: living.y,
    width: 4,
    height: 0.5,
    orientation: "horizontal",
  })

  const corridor = rooms.find((r) => r.type === "corridor")
  rooms
    .filter((r) => r.type === "bedroom" || r.name === "Common Bathroom")
    .forEach((room) => {
      if (corridor) {
        doors.push({
          x: room.x + room.width / 2,
          y: corridor.y + corridor.height,
          width: 3,
          height: 0.5,
          orientation: "horizontal",
        })
      }
    })

  const masterBed = rooms.find((r) => r.name === "Master Bedroom")
  const masterBath = rooms.find((r) => r.name === "Master Bathroom")
  if (masterBed && masterBath) {
    doors.push({
      x: masterBed.x,
      y: masterBed.y + masterBed.height / 2,
      width: 0.5,
      height: 3,
      orientation: "vertical",
    })
  }

  rooms.forEach((room) => {
    if (room.y + room.height >= plotWidth - setback - 1) {
      windows.push({
        x: room.x + room.width / 2,
        y: room.y + room.height,
        width: 4,
        height: 0.5,
        orientation: "horizontal",
      })
    }
    if (room.y <= setback + 1) {
      windows.push({
        x: room.x + room.width / 2,
        y: room.y,
        width: 4,
        height: 0.5,
        orientation: "horizontal",
      })
    }
    if (room.x + room.width >= plotLength - setback - 1) {
      windows.push({
        x: room.x + room.width,
        y: room.y + room.height / 2,
        width: 0.5,
        height: 4,
        orientation: "vertical",
      })
    }
    if (room.x <= setback + 1) {
      windows.push({
        x: room.x,
        y: room.y + room.height / 2,
        width: 0.5,
        height: 4,
        orientation: "vertical",
      })
    }
  })

  return { doors, windows }
}
