"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Rectangle, useMap } from "react-leaflet"
import { LatLngBounds } from "leaflet"
import "leaflet/dist/leaflet.css"
import { SD_CENTER, SD_BOUNDS, Yacht } from "@/lib/types"
import YachtMarker from "./YachtMarker"

// Fix Leaflet default icon issue with Next.js
import L from "leaflet"
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function FlyToYacht({ yacht }: { yacht: Yacht | null }) {
  const map = useMap()
  useEffect(() => {
    if (yacht) {
      map.flyTo([yacht.lat, yacht.lng], 13, { duration: 0.8 })
    }
  }, [yacht, map])
  return null
}

const sdBounds = new LatLngBounds(
  [SD_BOUNDS.south, SD_BOUNDS.west],
  [SD_BOUNDS.north, SD_BOUNDS.east]
)

interface Props {
  yachts: Yacht[]
  selectedYacht: Yacht | null
  onSelectYacht: (yacht: Yacht) => void
}

export default function Map({ yachts, selectedYacht, onSelectYacht }: Props) {
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

      {/* Monitoring zone geofence */}
      <Rectangle
        bounds={sdBounds}
        pathOptions={{
          color: "#3b82f6",
          weight: 1.5,
          opacity: 0.5,
          fillOpacity: 0.05,
          dashArray: "6 4",
        }}
      />

      {yachts.map((yacht) => (
        <YachtMarker
          key={yacht.mmsi}
          yacht={yacht}
          selected={selectedYacht?.mmsi === yacht.mmsi}
          onClick={() => onSelectYacht(yacht)}
        />
      ))}

      <FlyToYacht yacht={selectedYacht} />
    </MapContainer>
  )
}
