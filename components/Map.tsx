"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Rectangle, useMap } from "react-leaflet"
import { LatLngBounds } from "leaflet"
import "leaflet/dist/leaflet.css"
import { SD_CENTER, SD_BOUNDS, SOCAL_BOUNDS, Yacht, Aircraft, TrackerMode } from "@/lib/types"
import YachtMarker from "./YachtMarker"
import JetMarker from "./JetMarker"

import L from "leaflet"
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function FlyTo({ yacht, aircraft }: { yacht: Yacht | null; aircraft: Aircraft | null }) {
  const map = useMap()
  useEffect(() => {
    if (yacht)     map.flyTo([yacht.lat, yacht.lng], 13, { duration: 0.8 })
    else if (aircraft) map.flyTo([aircraft.lat, aircraft.lng], 11, { duration: 0.8 })
  }, [yacht, aircraft, map])
  return null
}

const sdBounds     = new LatLngBounds([SD_BOUNDS.south, SD_BOUNDS.west],     [SD_BOUNDS.north, SD_BOUNDS.east])
const socalBounds  = new LatLngBounds([SOCAL_BOUNDS.south, SOCAL_BOUNDS.west], [SOCAL_BOUNDS.north, SOCAL_BOUNDS.east])

interface Props {
  mode: TrackerMode
  yachts: Yacht[]
  aircraft: Aircraft[]
  selectedYacht: Yacht | null
  selectedAircraft: Aircraft | null
  onSelectYacht: (y: Yacht) => void
  onSelectAircraft: (a: Aircraft) => void
}

export default function Map({
  mode, yachts, aircraft, selectedYacht, selectedAircraft, onSelectYacht, onSelectAircraft
}: Props) {
  const showYachts = mode !== "jets"
  const showJets   = mode !== "yachts"

  return (
    <MapContainer
      center={SD_CENTER}
      zoom={8}
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {/* Geofence zones */}
      {showYachts && (
        <Rectangle
          bounds={sdBounds}
          pathOptions={{ color: "#3b82f6", weight: 1.5, opacity: 0.5, fillOpacity: 0.05, dashArray: "6 4" }}
        />
      )}
      {showJets && (
        <Rectangle
          bounds={socalBounds}
          pathOptions={{ color: "#a855f7", weight: 1.5, opacity: 0.4, fillOpacity: 0.03, dashArray: "6 4" }}
        />
      )}

      {showYachts && yachts.map((y) => (
        <YachtMarker
          key={y.mmsi}
          yacht={y}
          selected={selectedYacht?.mmsi === y.mmsi}
          onClick={() => onSelectYacht(y)}
        />
      ))}

      {showJets && aircraft.map((a) => (
        <JetMarker
          key={a.icao24}
          aircraft={a}
          selected={selectedAircraft?.icao24 === a.icao24}
          onClick={() => onSelectAircraft(a)}
        />
      ))}

      <FlyTo yacht={selectedYacht} aircraft={selectedAircraft} />
    </MapContainer>
  )
}
