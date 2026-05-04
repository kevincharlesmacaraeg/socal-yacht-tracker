"use client"

import dynamic from "next/dynamic"
import { useState, useEffect, useRef } from "react"
import { Yacht, Aircraft, GeofenceEvent, ZoneEvent, SD_BOUNDS, SOCAL_BOUNDS, TrackerMode } from "@/lib/types"
import { MOCK_YACHTS } from "@/lib/mockData"
import { MOCK_AIRCRAFT } from "@/lib/jetMockData"
import Sidebar from "@/components/Sidebar"
import YachtDetail from "@/components/YachtDetail"
import JetDetail from "@/components/JetDetail"

const Map = dynamic(() => import("@/components/Map"), { ssr: false })

function yachtInZone(y: Yacht): boolean {
  return y.lat >= SD_BOUNDS.south && y.lat <= SD_BOUNDS.north &&
         y.lng >= SD_BOUNDS.west  && y.lng <= SD_BOUNDS.east
}

function jetInZone(a: Aircraft): boolean {
  return a.lat >= SOCAL_BOUNDS.south && a.lat <= SOCAL_BOUNDS.north &&
         a.lng >= SOCAL_BOUNDS.west  && a.lng <= SOCAL_BOUNDS.east
}

export default function Home() {
  const [mode, setMode] = useState<TrackerMode>("both")

  // ── Yacht state ───────────────────────────────────────────
  const [yachts, setYachts]               = useState<Yacht[]>(MOCK_YACHTS)
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null)
  const [yachtEvents, setYachtEvents]     = useState<GeofenceEvent[]>([])
  const [isAisLive, setIsAisLive]         = useState(false)
  const yachtPositions = useRef<globalThis.Map<string, boolean>>(new globalThis.Map())
  const wsRef = useRef<WebSocket | null>(null)

  // ── Jet state ─────────────────────────────────────────────
  const [aircraft, setAircraft]               = useState<Aircraft[]>(MOCK_AIRCRAFT)
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null)
  const [jetEvents, setJetEvents]             = useState<ZoneEvent[]>([])
  const [isOpenSkyLive, setIsOpenSkyLive]     = useState(false)
  const [openSkyError, setOpenSkyError]       = useState<string | null>(null)
  const [openSkyUpdated, setOpenSkyUpdated]   = useState<Date | null>(null)
  const jetPositions = useRef<globalThis.Map<string, boolean>>(new globalThis.Map())
  const openSkyCtrl = useRef<import("@/lib/opensky").OpenSkyController | null>(null)
  const [isOpenSkyRefreshing, setIsOpenSkyRefreshing] = useState(false)

  // ── Mobile sidebar drawer ─────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const closeSidebarOnMobile = () => setIsSidebarOpen(false)
  const handleSelectYacht = (y: Yacht) => { setSelectedYacht(y); closeSidebarOnMobile() }
  const handleSelectAircraft = (a: Aircraft) => { setSelectedAircraft(a); closeSidebarOnMobile() }

  // Clear selections when switching modes so no stale detail panel appears
  const handleSetMode = (m: TrackerMode) => {
    setMode(m)
    if (m === "jets")   { setSelectedYacht(null) }
    if (m === "yachts") { setSelectedAircraft(null) }
  }

  // ── Demo: move underway yachts ─────────────────────────────
  useEffect(() => {
    if (isAisLive || mode === "jets") return
    const id = setInterval(() => {
      setYachts((prev) =>
        prev.map((y) => {
          if (y.status !== "underway") return y
          const rad = (y.heading * Math.PI) / 180
          return { ...y, lat: y.lat + Math.cos(rad) * 0.001, lng: y.lng + Math.sin(rad) * 0.0013, lastSeen: new Date() }
        })
      )
    }, 2000)
    return () => clearInterval(id)
  }, [isAisLive, mode])

  // ── Demo: move airborne jets ───────────────────────────────
  useEffect(() => {
    if (isOpenSkyLive || mode === "yachts") return
    const id = setInterval(() => {
      setAircraft((prev) =>
        prev.map((a) => {
          if (a.status !== "airborne") return a
          const rad = (a.heading * Math.PI) / 180
          return { ...a, lat: a.lat + Math.cos(rad) * 0.003, lng: a.lng + Math.sin(rad) * 0.004, lastSeen: new Date() }
        })
      )
    }, 2000)
    return () => clearInterval(id)
  }, [isOpenSkyLive, mode])

  // ── Yacht geofence ─────────────────────────────────────────
  useEffect(() => {
    yachts.forEach((y) => {
      const wasIn = yachtPositions.current.get(y.mmsi)
      const isIn  = yachtInZone(y)
      if (wasIn === undefined) { yachtPositions.current.set(y.mmsi, isIn); return }
      if (wasIn && !isIn)  setYachtEvents((p) => [{ mmsi: y.mmsi, yachtName: y.name, type: "exit",  timestamp: new Date() }, ...p])
      if (!wasIn && isIn)  setYachtEvents((p) => [{ mmsi: y.mmsi, yachtName: y.name, type: "enter", timestamp: new Date() }, ...p])
      yachtPositions.current.set(y.mmsi, isIn)
    })
  }, [yachts])

  // ── Jet geofence ───────────────────────────────────────────
  useEffect(() => {
    aircraft.forEach((a) => {
      const wasIn = jetPositions.current.get(a.icao24)
      const isIn  = jetInZone(a)
      if (wasIn === undefined) { jetPositions.current.set(a.icao24, isIn); return }
      const name  = a.owner?.name ?? a.tailNumber
      if (wasIn && !isIn)  setJetEvents((p) => [{ icao24: a.icao24, ownerName: name, type: "exit",  timestamp: new Date() }, ...p])
      if (!wasIn && isIn)  setJetEvents((p) => [{ icao24: a.icao24, ownerName: name, type: "enter", timestamp: new Date() }, ...p])
      jetPositions.current.set(a.icao24, isIn)
    })
  }, [aircraft])

  const resetMockYachts = () => {
    if (isAisLive) return
    setYachts(MOCK_YACHTS)
    yachtPositions.current.clear()
  }

  // ── Live: AIS (yachts) ────────────────────────────────────
  const toggleAis = () => {
    if (isAisLive) {
      wsRef.current?.close(); wsRef.current = null
      setIsAisLive(false); setYachts(MOCK_YACHTS)
    } else {
      const apiKey = process.env.NEXT_PUBLIC_AIS_API_KEY || prompt("Enter your AISStream.io API key:")
      if (!apiKey) return
      import("@/lib/aisstream").then(({ connectAISStream }) => {
        wsRef.current = connectAISStream(apiKey, (yacht) => {
          setYachts((prev) => {
            const idx = prev.findIndex((y) => y.mmsi === yacht.mmsi)
            if (idx === -1) return [...prev, yacht]
            const updated = [...prev]; updated[idx] = { ...updated[idx], ...yacht }; return updated
          })
        })
        setIsAisLive(true); setYachts([])
      })
    }
  }

  // ── Live: OpenSky (jets) ──────────────────────────────────
  const toggleOpenSky = () => {
    if (isOpenSkyLive) {
      openSkyCtrl.current?.stop(); openSkyCtrl.current = null
      setIsOpenSkyLive(false); setOpenSkyError(null); setOpenSkyUpdated(null); setAircraft(MOCK_AIRCRAFT)
    } else {
      setIsOpenSkyLive(true); setAircraft([]); setOpenSkyError(null)
      import("@/lib/opensky").then(({ startLiveTracking }) => {
        openSkyCtrl.current = startLiveTracking(
          (jets) => { setAircraft(jets); setOpenSkyUpdated(new Date()); setOpenSkyError(null); setIsOpenSkyRefreshing(false) },
          (msg)  => { setOpenSkyError(msg); setIsOpenSkyRefreshing(false) }
        )
      })
    }
  }

  const refreshOpenSky = async () => {
    if (!openSkyCtrl.current || isOpenSkyRefreshing) return
    setIsOpenSkyRefreshing(true)
    await openSkyCtrl.current.refresh()
  }

  return (
    <div className="relative md:flex h-[100dvh] w-screen overflow-hidden bg-gray-950">
      {/* Sidebar — drawer on mobile, inline column on md+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-[1100] w-[85vw] max-w-[20rem] transform transition-transform duration-300 ease-out md:static md:translate-x-0 md:transform-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          mode={mode}
          onSetMode={handleSetMode}
          yachts={yachts}
          selectedYacht={selectedYacht}
          onSelectYacht={handleSelectYacht}
          yachtEvents={yachtEvents}
          isAisLive={isAisLive}
          onToggleAis={toggleAis}
          onResetMockYachts={resetMockYachts}
          aircraft={aircraft}
          selectedAircraft={selectedAircraft}
          onSelectAircraft={handleSelectAircraft}
          jetEvents={jetEvents}
          isOpenSkyLive={isOpenSkyLive}
          openSkyError={openSkyError}
          openSkyUpdated={openSkyUpdated}
          onToggleOpenSky={toggleOpenSky}
          onRefreshOpenSky={refreshOpenSky}
          isOpenSkyRefreshing={isOpenSkyRefreshing}
          onCloseMobile={closeSidebarOnMobile}
        />
      </aside>

      {/* Backdrop — mobile only, when drawer is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[1050] bg-black/50 md:hidden"
          onClick={closeSidebarOnMobile}
          aria-hidden="true"
        />
      )}

      <div className="relative h-full flex-1">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-3 left-3 z-[1000] flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-950/90 backdrop-blur border border-white/10 text-white text-sm font-medium shadow-lg active:scale-95 transition-transform"
          aria-label="Open sidebar"
        >
          <span className="text-base leading-none">☰</span>
          <span>{mode === "yachts" ? "Yachts" : mode === "jets" ? "Jets" : "Tracker"}</span>
        </button>

        <Map
          mode={mode}
          yachts={yachts}
          aircraft={aircraft}
          selectedYacht={selectedYacht}
          selectedAircraft={selectedAircraft}
          onSelectYacht={setSelectedYacht}
          onSelectAircraft={setSelectedAircraft}
        />
        {selectedYacht && mode !== "jets" && (
          <YachtDetail yacht={selectedYacht} onClose={() => setSelectedYacht(null)} />
        )}
        {selectedAircraft && mode !== "yachts" && (
          <JetDetail aircraft={selectedAircraft} onClose={() => setSelectedAircraft(null)} />
        )}
      </div>
    </div>
  )
}
