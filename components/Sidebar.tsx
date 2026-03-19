"use client"

import { Yacht, GeofenceEvent } from "@/lib/types"
import YachtCard from "./YachtCard"

interface Props {
  yachts: Yacht[]
  selectedYacht: Yacht | null
  onSelectYacht: (yacht: Yacht) => void
  events: GeofenceEvent[]
  isLive: boolean
  onToggleLive: () => void
}

export default function Sidebar({
  yachts,
  selectedYacht,
  onSelectYacht,
  events,
  isLive,
  onToggleLive,
}: Props) {
  const underway = yachts.filter((y) => y.status === "underway").length
  const moored = yachts.filter((y) => y.status === "moored").length
  const anchored = yachts.filter((y) => y.status === "anchored").length

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white w-80 shrink-0 border-r border-white/10">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">SoCal Yacht Tracker</h1>
            <p className="text-xs text-gray-400 mt-0.5">San Diego → Santa Barbara · Super Yachts (24m+)</p>
          </div>
          <button
            onClick={onToggleLive}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              isLive
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-white/10 text-gray-400 border border-white/10"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-gray-500"}`}
            />
            {isLive ? "Live" : "Demo"}
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <Stat label="Total" value={yachts.length} color="text-white" />
          <Stat label="Underway" value={underway} color="text-green-400" />
          <Stat label="Anchored" value={anchored} color="text-amber-400" />
          <Stat label="Moored" value={moored} color="text-blue-400" />
        </div>
      </div>

      {/* Vessel list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-3 space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-1 mb-2">
            Vessels in zone
          </p>
          {yachts.map((yacht) => (
            <YachtCard
              key={yacht.mmsi}
              yacht={yacht}
              selected={selectedYacht?.mmsi === yacht.mmsi}
              onClick={() => onSelectYacht(yacht)}
            />
          ))}
        </div>
      </div>

      {/* Activity log */}
      {events.length > 0 && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Activity</p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {events.slice(0, 10).map((event, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className={`shrink-0 font-bold ${
                    event.type === "enter" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {event.type === "enter" ? "→" : "←"}
                </span>
                <span className="text-gray-300 truncate">{event.yachtName}</span>
                <span className="text-gray-600 shrink-0 ml-auto">
                  {event.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API key notice */}
      {!isLive && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing demo data.{" "}
            <a
              href="https://aisstream.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-300"
            >
              Get a free AIS key
            </a>{" "}
            to go live.
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
