"use client"

import { Aircraft } from "@/lib/types"

interface Props {
  aircraft: Aircraft
  selected: boolean
  onClick: () => void
}

const statusColors = {
  airborne: "bg-green-500",
  taxiing:  "bg-amber-500",
  parked:   "bg-blue-500",
}

const statusLabels = {
  airborne: "Airborne",
  taxiing:  "Taxiing",
  parked:   "Parked",
}

export default function JetCard({ aircraft, selected, onClick }: Props) {
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
            <span className="font-semibold text-white text-sm truncate">{aircraft.tailNumber}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5 truncate">{aircraft.aircraftType}</div>
        </div>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full text-white font-medium ${statusColors[aircraft.status]}`}
        >
          {statusLabels[aircraft.status]}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-x-2 text-xs">
        <Stat label="Speed"   value={`${aircraft.speed} kts`} />
        <Stat label="Alt"     value={aircraft.altitude > 0 ? `${Math.round(aircraft.altitude / 1000)}k ft` : "GND"} />
        <Stat label="Heading" value={`${aircraft.heading}°`} />
      </div>

      {aircraft.owner && (
        <div className="mt-2 text-xs text-gray-400 truncate">
          Owner: <span className="text-gray-200">{aircraft.owner.name}</span>
        </div>
      )}
      {(aircraft.origin || aircraft.destination) && (
        <div className="mt-1 text-xs text-gray-400">
          {aircraft.origin && <span>{aircraft.origin}</span>}
          {aircraft.origin && aircraft.destination && <span className="text-gray-600"> → </span>}
          {aircraft.destination && <span className="text-gray-200">{aircraft.destination}</span>}
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
