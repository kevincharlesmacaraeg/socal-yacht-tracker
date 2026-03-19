/**
 * AISStream.io WebSocket client
 * Sign up for a free API key at https://aisstream.io
 *
 * Free tier: 1 connection, unlimited messages for vessels in your bounding box
 */

import { SD_BOUNDS, Yacht } from "./types"

type AISMessageHandler = (yacht: Yacht) => void

export function connectAISStream(apiKey: string, onMessage: AISMessageHandler): WebSocket {
  const ws = new WebSocket("wss://stream.aisstream.io/v0/stream")

  ws.onopen = () => {
    console.log("[AISStream] Connected")
    ws.send(
      JSON.stringify({
        APIKey: apiKey,
        BoundingBoxes: [
          [
            [SD_BOUNDS.south, SD_BOUNDS.west],
            [SD_BOUNDS.north, SD_BOUNDS.east],
          ],
        ],
        // Filter: only pleasure craft / yachts (type 37) and sailing vessels (type 36)
        // Larger vessels we want: type 0 = unknown, 36 = sailing, 37 = pleasure
        FilterMessageTypes: ["PositionReport"],
      })
    )
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const pos = data.Message?.PositionReport
      const meta = data.MetaData

      if (!pos || !meta) return

      // Only include vessels >= 24m (super yachts)
      // Note: length isn't in position reports — you'd cross-reference with a vessel DB
      // For now, pass through all and filter in UI or enrich via MarineTraffic static data

      const yacht: Yacht = {
        mmsi: String(meta.MMSI),
        name: meta.ShipName?.trim() || `MMSI ${meta.MMSI}`,
        flag: "🚢",
        length: 0, // enriched separately
        lat: pos.Latitude,
        lng: pos.Longitude,
        speed: pos.Sog || 0,
        heading: pos.Cog || 0,
        status: pos.NavigationalStatus === 1 ? "anchored" : pos.Sog < 0.5 ? "moored" : "underway",
        lastSeen: new Date(meta.time_utc),
        callsign: meta.CallSign?.trim(),
      }

      onMessage(yacht)
    } catch (err) {
      console.error("[AISStream] Parse error", err)
    }
  }

  ws.onerror = (err) => console.error("[AISStream] Error", err)
  ws.onclose = () => console.log("[AISStream] Disconnected")

  return ws
}
