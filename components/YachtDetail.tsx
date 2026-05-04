"use client"

import { Yacht } from "@/lib/types"

interface Props {
  yacht: Yacht
  onClose: () => void
}

const statusColors = {
  underway: "text-green-400 bg-green-400/10 border-green-400/20",
  anchored: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  moored: "text-blue-400 bg-blue-400/10 border-blue-400/20",
}

export default function YachtDetail({ yacht, onClose }: Props) {
  return (
    <div className="absolute z-[1000] bottom-2 left-2 right-2 md:left-auto md:bottom-4 md:right-4 md:w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-gray-950/95 backdrop-blur shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{yacht.flag}</span>
            <h2 className="text-base font-bold tracking-wide">{yacht.name}</h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[yacht.status]}`}>
              {yacht.status}
            </span>
            {yacht.builder && (
              <span className="text-xs text-gray-500">{yacht.builder} · {yacht.builtYear}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-lg leading-none mt-0.5"
        >
          ✕
        </button>
      </div>

      {/* Owner section */}
      {yacht.owner && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Owner</p>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{yacht.owner.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{yacht.owner.title}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-gray-500">{yacht.owner.nationality}</span>
                <span className="text-gray-600">·</span>
                <span className="text-green-400 font-medium">{yacht.owner.netWorth}</span>
              </div>
            </div>
          </div>
          <a
            href={yacht.owner.wikipediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
            </svg>
            Wikipedia →
          </a>
        </div>
      )}

      {/* Vessel stats */}
      <div className="px-4 py-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Vessel Data</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <DetailStat label="Length" value={`${yacht.length}m`} />
          <DetailStat label="Speed" value={`${yacht.speed} knots`} />
          <DetailStat label="Heading" value={`${yacht.heading}°`} />
          <DetailStat label="MMSI" value={yacht.mmsi} />
          {yacht.callsign && <DetailStat label="Callsign" value={yacht.callsign} />}
          {yacht.destination && <DetailStat label="Destination" value={yacht.destination} />}
          <DetailStat label="Position" value={`${yacht.lat.toFixed(4)}°N`} />
          <DetailStat label="" value={`${Math.abs(yacht.lng).toFixed(4)}°W`} />
        </div>
      </div>
    </div>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      {label && <div className="text-gray-500">{label}</div>}
      <div className="text-gray-200 font-medium">{value}</div>
    </div>
  )
}
