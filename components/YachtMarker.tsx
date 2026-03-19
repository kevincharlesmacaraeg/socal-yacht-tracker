"use client"

import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { Yacht } from "@/lib/types"

function createYachtIcon(yacht: Yacht, selected: boolean) {
  const color = yacht.status === "underway" ? "#22c55e" : yacht.status === "anchored" ? "#f59e0b" : "#3b82f6"
  const ring = selected ? `<circle cx="20" cy="20" r="13" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.7"/>` : ""

  const html = `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center; gap:3px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        ${ring}
        <g transform="rotate(${yacht.heading}, 20, 20)">
          <polygon points="20,6 27,30 20,25 13,30" fill="${color}" stroke="rgba(0,0,0,0.5)" stroke-width="1.5"/>
        </g>
      </svg>
      <div style="
        background: rgba(10,10,20,0.88);
        border: 1px solid ${color}66;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        font-family: ui-sans-serif, system-ui, sans-serif;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        line-height: 1.4;
        box-shadow: 0 1px 6px rgba(0,0,0,0.7);
        text-align: center;
      ">${yacht.owner ? yacht.owner.name : yacht.name}
        <span style="display:block; font-size:9px; font-weight:400; color: ${color}; letter-spacing:0.04em; margin-top:-1px;">${yacht.name}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: "",
    iconSize: [80, 60],
    iconAnchor: [40, 22],
    popupAnchor: [0, -24],
  })
}

interface Props {
  yacht: Yacht
  selected: boolean
  onClick: () => void
}

export default function YachtMarker({ yacht, selected, onClick }: Props) {
  return (
    <Marker
      position={[yacht.lat, yacht.lng]}
      icon={createYachtIcon(yacht, selected)}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-sm font-medium">{yacht.flag} {yacht.name}</div>
        <div className="text-xs text-gray-500 mt-1">
          {yacht.speed} kn · {yacht.status}
          {yacht.owner && <> · {yacht.owner.name}</>}
        </div>
      </Popup>
    </Marker>
  )
}
