"use client"

import { Yacht } from "@/lib/types"

interface Props {
  yacht: Yacht
  selected: boolean
  onClick: () => void
}

const statusColors = {
  underway: "bg-green-500",
  anchored: "bg-amber-500",
  moored: "bg-blue-500",
}

const statusLabels = {
  underway: "Underway",
  anchored: "Anchored",
  moored: "Moored",
}

export default function YachtCard({ yacht, selected, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-3 transition-all ${
        selected
          ? "border-blue-500 bg-blue-950/40 shadow-md shadow-blue-500/20"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{yacht.flag}</span>
            <span className="font-semibold text-white text-sm truncate">{yacht.name}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">MMSI {yacht.mmsi}</div>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full text-white font-medium ${statusColors[yacht.status]}`}
        >
          {statusLabels[yacht.status]}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-x-2 text-xs">
        <Stat label="Length" value={`${yacht.length}m`} />
        <Stat label="Speed" value={`${yacht.speed} kn`} />
        <Stat label="Heading" value={`${yacht.heading}°`} />
      </div>

      {yacht.owner && (
        <div className="mt-2 text-xs text-gray-400 truncate">
          Owner: <span className="text-gray-200">{yacht.owner.name}</span>
        </div>
      )}
      {yacht.destination && (
        <div className="mt-1 text-xs text-gray-400">
          → <span className="text-gray-200">{yacht.destination}</span>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-200 font-medium">{value}</div>
    </div>
  )
}
