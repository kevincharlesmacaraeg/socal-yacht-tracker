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

// ── Jets ──────────────────────────────────────────────────

export interface Aircraft {
  icao24: string        // Mode-S hex transponder code
  tailNumber: string    // e.g. "N628TS"
  callsign?: string
  lat: number
  lng: number
  altitude: number      // feet (0 if on ground)
  speed: number         // knots
  heading: number       // degrees
  status: "airborne" | "taxiing" | "parked"
  onGround: boolean
  lastSeen: Date
  origin?: string
  destination?: string
  aircraftType: string
  owner?: Owner
}

export interface ZoneEvent {
  icao24: string
  ownerName: string
  type: "enter" | "exit"
  timestamp: Date
}

// Wider zone for jets — includes inland airports (Palm Springs etc.)
export const SOCAL_BOUNDS = {
  north: 35.1,
  south: 32.5,
  east:  -115.5,
  west:  -120.5,
}

export type TrackerMode = "yachts" | "both" | "jets"
