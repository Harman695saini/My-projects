import type { ElectricalRules } from "../types/electrical-types"

export const defaultElectricalRules: ElectricalRules = {
  living: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "fan", count: 1, placement: "ceiling", priority: 3 },
      { type: "socket5A", count: 2, placement: "wall", priority: 4, amperage: 5 },
      { type: "ac", count: 1, placement: "wall", priority: 5, amperage: 15 },
      { type: "tv", count: 1, placement: "wall", priority: 6 },
    ],
  },
  bedroom: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "fan", count: 1, placement: "ceiling", priority: 3 },
      { type: "socket5A", count: 2, placement: "wall", priority: 4, amperage: 5 },
      { type: "ac", count: 1, placement: "wall", priority: 5, amperage: 15 },
    ],
  },
  kitchen: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "socket15A", count: 3, placement: "wall", priority: 3, amperage: 15 },
      { type: "exhaust", count: 1, placement: "wall", priority: 4 },
    ],
  },
  bathroom: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "geyser", count: 1, placement: "wall", priority: 3, amperage: 15 },
      { type: "exhaust", count: 1, placement: "wall", priority: 4 },
    ],
  },
  utility: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "washing", count: 1, placement: "wall", priority: 3, amperage: 15 },
      { type: "socket15A", count: 1, placement: "wall", priority: 4, amperage: 15 },
    ],
  },
  entrance: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "MDB", count: 1, placement: "wall", priority: 0 },
    ],
  },
  office: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "socket5A", count: 3, placement: "wall", priority: 3, amperage: 5 },
      { type: "ac", count: 1, placement: "wall", priority: 4, amperage: 15 },
    ],
  },
  dining: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
      { type: "socket5A", count: 1, placement: "wall", priority: 3, amperage: 5 },
    ],
  },
  corridor: {
    components: [
      { type: "switch", count: 1, placement: "wall", priority: 1 },
      { type: "light", count: 1, placement: "ceiling", priority: 2 },
    ],
  },
}
