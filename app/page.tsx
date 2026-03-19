"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { Yacht, GeofenceEvent, SD_BOUNDS } from "@/lib/types"
import { MOCK_YACHTS } from "@/lib/mockData"
import Sidebar from "@/components/Sidebar"
import YachtDetail from "@/components/YachtDetail"

// Leaflet must be loaded client-side only
const Map = dynamic(() => import("@/components/Map"), { ssr: false })

function isInZone(yacht: Yacht): boolean {
  return (
    yacht.lat >= SD_BOUNDS.south &&
    yacht.lat <= SD_BOUNDS.north &&
    yacht.lng >= SD_BOUNDS.west &&
    yacht.lng <= SD_BOUNDS.east
  )
}

export default function Home() {
  const [yachts, setYachts] = useState<Yacht[]>(MOCK_YACHTS)
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null)
  const [events, setEvents] = useState<GeofenceEvent[]>([])
  const [isLive, setIsLive] = useState(false)
  const prevPositions = useRef<globalThis.Map<string, boolean>>(new globalThis.Map())
  const wsRef = useRef<WebSocket | null>(null)

  // Simulate gentle movement of demo yachts
  useEffect(() => {
    if (isLive) return
    const interval = setInterval(() => {
      setYachts((prev) =>
        prev.map((y) => {
          if (y.status !== "underway") return y
          const rad = (y.heading * Math.PI) / 180
          const newLat = y.lat + Math.cos(rad) * 0.001
          const newLng = y.lng + Math.sin(rad) * 0.0013
          return { ...y, lat: newLat, lng: newLng, lastSeen: new Date() }
        })
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [isLive])

  // Geofence check
  useEffect(() => {
    yachts.forEach((yacht) => {
      const wasIn = prevPositions.current.get(yacht.mmsi)
      const isIn = isInZone(yacht)
      if (wasIn === undefined) {
        prevPositions.current.set(yacht.mmsi, isIn)
        return
      }
      if (wasIn && !isIn) {
        setEvents((prev) => [
          { mmsi: yacht.mmsi, yachtName: yacht.name, type: "exit", timestamp: new Date() },
          ...prev,
        ])
      } else if (!wasIn && isIn) {
        setEvents((prev) => [
          { mmsi: yacht.mmsi, yachtName: yacht.name, type: "enter", timestamp: new Date() },
          ...prev,
        ])
      }
      prevPositions.current.set(yacht.mmsi, isIn)
    })
  }, [yachts])

  // Live AIS connection
  const toggleLive = () => {
    if (isLive) {
      wsRef.current?.close()
      wsRef.current = null
      setIsLive(false)
      setYachts(MOCK_YACHTS)
    } else {
      const apiKey = process.env.NEXT_PUBLIC_AIS_API_KEY || prompt("Enter your AISStream.io API key:")
      if (!apiKey) return
      import("@/lib/aisstream").then(({ connectAISStream }) => {
        wsRef.current = connectAISStream(apiKey, (yacht) => {
          setYachts((prev) => {
            const idx = prev.findIndex((y) => y.mmsi === yacht.mmsi)
            if (idx === -1) return [...prev, yacht]
            const updated = [...prev]
            updated[idx] = { ...updated[idx], ...yacht }
            return updated
          })
        })
        setIsLive(true)
        setYachts([])
      })
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-950">
      <Sidebar
        yachts={yachts}
        selectedYacht={selectedYacht}
        onSelectYacht={setSelectedYacht}
        events={events}
        isLive={isLive}
        onToggleLive={toggleLive}
      />
      <div className="flex-1 relative">
        <Map
          yachts={yachts}
          selectedYacht={selectedYacht}
          onSelectYacht={setSelectedYacht}
        />
        {selectedYacht && (
          <YachtDetail
            yacht={selectedYacht}
            onClose={() => setSelectedYacht(null)}
          />
        )}
      </div>
    </div>
  )
}
