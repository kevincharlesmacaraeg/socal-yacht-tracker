"use client"

import { Yacht, Aircraft, GeofenceEvent, ZoneEvent, TrackerMode } from "@/lib/types"
import YachtCard from "./YachtCard"
import JetCard from "./JetCard"

interface Props {
  mode: TrackerMode
  onSetMode: (m: TrackerMode) => void
  // yachts
  yachts: Yacht[]
  selectedYacht: Yacht | null
  onSelectYacht: (y: Yacht) => void
  yachtEvents: GeofenceEvent[]
  isAisLive: boolean
  onToggleAis: () => void
  // jets
  aircraft: Aircraft[]
  selectedAircraft: Aircraft | null
  onSelectAircraft: (a: Aircraft) => void
  jetEvents: ZoneEvent[]
  isOpenSkyLive: boolean
  openSkyError: string | null
  openSkyUpdated: Date | null
  onToggleOpenSky: () => void
}

const MODES: { value: TrackerMode; label: string; icon: string }[] = [
  { value: "yachts", label: "Yachts", icon: "🛥" },
  { value: "both",   label: "Both",   icon: "⊕" },
  { value: "jets",   label: "Jets",   icon: "✈️" },
]

export default function Sidebar({
  mode, onSetMode,
  yachts, selectedYacht, onSelectYacht, yachtEvents, isAisLive, onToggleAis,
  aircraft, selectedAircraft, onSelectAircraft, jetEvents, isOpenSkyLive, openSkyError, openSkyUpdated, onToggleOpenSky,
}: Props) {
  const showYachts = mode !== "jets"
  const showJets   = mode !== "yachts"

  const yUnderway  = yachts.filter((y) => y.status === "underway").length
  const yAnchored  = yachts.filter((y) => y.status === "anchored").length
  const yMoored    = yachts.filter((y) => y.status === "moored").length
  const jAirborne  = aircraft.filter((a) => a.status === "airborne").length
  const jTaxiing   = aircraft.filter((a) => a.status === "taxiing").length
  const jParked    = aircraft.filter((a) => a.status === "parked").length

  // Merged activity log sorted by time
  const allEvents = [
    ...yachtEvents.map((e) => ({ name: e.yachtName, type: e.type, ts: e.timestamp, kind: "yacht" as const })),
    ...jetEvents.map((e)  => ({ name: e.ownerName,  type: e.type, ts: e.timestamp, kind: "jet" as const })),
  ].sort((a, b) => b.ts.getTime() - a.ts.getTime()).slice(0, 12)

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white w-80 shrink-0 border-r border-white/10">

      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-tight">
          {mode === "yachts" ? "SoCal Yacht Tracker" : mode === "jets" ? "SoCal Jet Tracker" : "SoCal Tracker"}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {mode === "yachts" ? "San Diego → Santa Barbara · Super Yachts (24m+)"
           : mode === "jets" ? "San Diego → Palm Springs · Private Jets"
           : "Southern California · Yachts & Private Jets"}
        </p>

        {/* Mode toggle */}
        <div className="mt-3 flex rounded-lg overflow-hidden border border-white/10">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => onSetMode(m.value)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors ${
                mode === m.value
                  ? "bg-white/15 text-white"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-3 space-y-2">
          {showYachts && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 w-12 shrink-0">Yachts</span>
              <div className="flex-1 grid grid-cols-4 gap-1 text-center">
                <MiniStat label="Total"   value={yachts.length}  color="text-white" />
                <MiniStat label="Underway" value={yUnderway}     color="text-green-400" />
                <MiniStat label="Anchored" value={yAnchored}     color="text-amber-400" />
                <MiniStat label="Moored"   value={yMoored}       color="text-blue-400" />
              </div>
              <LiveDot active={isAisLive} onClick={onToggleAis} label="AIS" />
            </div>
          )}
          {showJets && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 w-12 shrink-0">Jets</span>
              <div className="flex-1 grid grid-cols-4 gap-1 text-center">
                <MiniStat label="Total"   value={aircraft.length} color="text-white" />
                <MiniStat label="Airborne" value={jAirborne}      color="text-green-400" />
                <MiniStat label="Taxiing"  value={jTaxiing}       color="text-amber-400" />
                <MiniStat label="Parked"   value={jParked}        color="text-blue-400" />
              </div>
              <LiveDot active={isOpenSkyLive} onClick={onToggleOpenSky} label="ADS-B" />
            </div>
          )}
        </div>

        {/* Live status lines */}
        {isOpenSkyLive && showJets && (
          <div className="mt-2">
            {openSkyError
              ? <p className="text-xs text-red-400">⚠ {openSkyError}</p>
              : openSkyUpdated
              ? <p className="text-xs text-gray-600">OpenSky updated {openSkyUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
              : <p className="text-xs text-gray-600 animate-pulse">Fetching from OpenSky…</p>
            }
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="flex-1 overflow-y-auto">
        {showYachts && (
          <div className="px-3 pt-3 space-y-2">
            {mode === "both" && (
              <p className="text-xs text-gray-500 uppercase tracking-wider px-1 flex items-center gap-1.5">
                <span>🛥</span> Yachts in zone
              </p>
            )}
            {mode !== "both" && (
              <p className="text-xs text-gray-500 uppercase tracking-wider px-1 mb-2">Vessels in zone</p>
            )}
            {yachts.map((y) => (
              <YachtCard
                key={y.mmsi}
                yacht={y}
                selected={selectedYacht?.mmsi === y.mmsi}
                onClick={() => onSelectYacht(y)}
              />
            ))}
          </div>
        )}

        {showJets && (
          <div className="px-3 pt-3 space-y-2 pb-2">
            {mode === "both" && (
              <p className="text-xs text-gray-500 uppercase tracking-wider px-1 flex items-center gap-1.5 mt-1">
                <span>✈️</span> Jets in zone
              </p>
            )}
            {mode !== "both" && (
              <p className="text-xs text-gray-500 uppercase tracking-wider px-1 mb-2">Jets in zone</p>
            )}
            {aircraft.length === 0 && isOpenSkyLive && !openSkyError && (
              <p className="text-xs text-gray-600 px-1">No known jets detected in SoCal.</p>
            )}
            {aircraft.map((a) => (
              <JetCard
                key={a.icao24}
                aircraft={a}
                selected={selectedAircraft?.icao24 === a.icao24}
                onClick={() => onSelectAircraft(a)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Activity log */}
      {allEvents.length > 0 && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Activity</p>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {allEvents.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`shrink-0 font-bold ${e.type === "enter" ? "text-green-400" : "text-red-400"}`}>
                  {e.type === "enter" ? "→" : "←"}
                </span>
                <span className="mr-0.5">{e.kind === "yacht" ? "🛥" : "✈️"}</span>
                <span className="text-gray-300 truncate">{e.name}</span>
                <span className="text-gray-600 shrink-0 ml-auto">
                  {e.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer hints */}
      <div className="border-t border-white/10 px-4 py-3 space-y-1">
        {showYachts && !isAisLive && (
          <p className="text-xs text-gray-500">
            Yachts: demo data.{" "}
            <a href="https://aisstream.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Get AIS key</a>
            {" "}to go live.
          </p>
        )}
        {showJets && !isOpenSkyLive && (
          <p className="text-xs text-gray-500">
            Jets: demo data.{" "}
            <span
              className="text-blue-400 cursor-pointer hover:text-blue-300"
              onClick={onToggleOpenSky}
            >
              Go live
            </span>
            {" "}via OpenSky (no key needed).
          </p>
        )}
      </div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-600 leading-tight">{label}</div>
    </div>
  )
}

function LiveDot({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
        active
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-white/10 text-gray-500 border border-white/10"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
      {label}
    </button>
  )
}
