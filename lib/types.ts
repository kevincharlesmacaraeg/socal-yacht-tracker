export interface Owner {
  name: string
  title: string       // short descriptor, e.g. "Tech billionaire, founder of Oracle"
  netWorth: string    // e.g. "$140B"
  nationality: string
  wikipediaUrl: string
}

export interface Yacht {
  mmsi: string
  name: string
  flag: string
  length: number // meters
  lat: number
  lng: number
  speed: number // knots
  heading: number // degrees
  status: "anchored" | "underway" | "moored"
  lastSeen: Date
  destination?: string
  callsign?: string
  owner?: Owner
  builtYear?: number
  builder?: string
}

export interface GeofenceEvent {
  mmsi: string
  yachtName: string
  type: "enter" | "exit"
  timestamp: Date
}

// SoCal coastal monitoring zone (San Diego to Santa Barbara)
export const SD_BOUNDS = {
  north: 34.50,
  south: 32.60,
  east: -117.08,
  west: -120.05,
}

export const SD_CENTER: [number, number] = [33.70, -118.60]
