/**
 * OpenSky Network REST client
 * Free, no API key needed for anonymous access (rate limit: 1 request per 10s)
 * Docs: https://openskynetwork.github.io/opensky-api/rest.html
 *
 * In live mode we only show jets whose ICAO24 is in KNOWN_JETS.
 * To add a jet: look up its ICAO24 at https://globe.adsbexchange.com or
 * https://flightaware.com and add it to KNOWN_JETS in mockData.ts.
 */

import { SOCAL_BOUNDS, Aircraft } from "./types"
import { KNOWN_JETS } from "./jetMockData"

// State vector field indices from OpenSky API
const F_ICAO24    = 0
const F_CALLSIGN  = 1
const F_LAST_CONTACT = 4
const F_LNG       = 5
const F_LAT       = 6
const F_BARO_ALT  = 7   // meters
const F_ON_GROUND = 8
const F_VELOCITY  = 9   // m/s
const F_HEADING   = 10  // true track degrees
const F_GEO_ALT   = 13  // meters

export async function fetchKnownJets(): Promise<Aircraft[]> {
  const { north, south, east, west } = SOCAL_BOUNDS
  const url =
    `https://opensky-network.org/api/states/all` +
    `?lamin=${south}&lomin=${west}&lamax=${north}&lomax=${east}`

  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`OpenSky returned ${resp.status}`)

  const data = await resp.json()
  const results: Aircraft[] = []

  for (const state of data.states ?? []) {
    const icao24: string = state[F_ICAO24]
    const known = KNOWN_JETS[icao24]
    if (!known) continue  // only show jets we recognize

    const lat: number | null = state[F_LAT]
    const lng: number | null = state[F_LNG]
    if (lat === null || lng === null) continue

    const onGround: boolean = state[F_ON_GROUND]
    const velocityMs: number = state[F_VELOCITY] ?? 0
    const speedKts = Math.round(velocityMs * 1.94384)
    const baroMeters: number | null = state[F_BARO_ALT]
    const geoMeters: number | null = state[F_GEO_ALT]
    const altFt = Math.round(((baroMeters ?? geoMeters ?? 0)) * 3.28084)
    const heading: number = state[F_HEADING] ?? 0
    const callsign: string = (state[F_CALLSIGN] ?? "").trim() || undefined!
    const lastContact: number = state[F_LAST_CONTACT]

    const status: Aircraft["status"] = onGround
      ? speedKts > 5 ? "taxiing" : "parked"
      : "airborne"

    results.push({
      icao24,
      tailNumber: known.tailNumber,
      callsign: callsign || known.tailNumber,
      lat,
      lng,
      altitude: onGround ? 0 : altFt,
      speed: speedKts,
      heading,
      status,
      onGround,
      lastSeen: new Date(lastContact * 1000),
      aircraftType: known.aircraftType,
      owner: known.owner,
    })
  }

  return results
}

export interface OpenSkyController {
  stop: () => void
  refresh: () => Promise<void>
}

export function startLiveTracking(
  onUpdate: (aircraft: Aircraft[]) => void,
  onError: (msg: string) => void
): OpenSkyController {
  let cancelled = false

  async function poll() {
    if (cancelled) return
    try {
      const jets = await fetchKnownJets()
      if (!cancelled) onUpdate(jets)
    } catch (err) {
      if (!cancelled) onError(err instanceof Error ? err.message : "Fetch failed")
    }
  }

  poll()
  const timer = setInterval(poll, 15_000)  // OpenSky asks for ≥10s between requests

  return {
    stop: () => {
      cancelled = true
      clearInterval(timer)
    },
    refresh: poll,
  }
}
