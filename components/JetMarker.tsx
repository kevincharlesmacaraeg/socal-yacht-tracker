"use client"

import { Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { Aircraft } from "@/lib/types"

function createJetIcon(aircraft: Aircraft, selected: boolean) {
  const color =
    aircraft.status === "airborne" ? "#22c55e" :
    aircraft.status === "taxiing"  ? "#f59e0b" :
    "#3b82f6"

  const ring = selected
    ? `<circle cx="20" cy="20" r="15" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="4 2" opacity="0.7"/>`
    : ""

  // Plane viewed from above, nose pointing up (north) — rotated by heading
  const plane = `
    <g transform="rotate(${aircraft.heading}, 20, 20)">
      <polygon points="20,6 22,15 18,15" fill="${color}" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>
      <rect x="18.5" y="15" width="3" height="12" rx="1" fill="${color}"/>
      <polygon points="20,17 6,27 8,28 20,23 32,28 34,27" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
      <polygon points="20,26 14,32 15,33 20,29 25,33 26,32" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="0.5"/>
    </g>
  `

  const label = aircraft.owner ? aircraft.owner.name : aircraft.tailNumber
  const sub = aircraft.tailNumber

  const html = `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center; gap:3px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        ${ring}
        ${plane}
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
      ">${label}
        <span style="display:block; font-size:9px; font-weight:400; color: ${color}; letter-spacing:0.04em; margin-top:-1px;">${sub}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: "",
    iconSize: [100, 64],
    iconAnchor: [50, 22],
    popupAnchor: [0, -24],
  })
}

interface Props {
  aircraft: Aircraft
  selected: boolean
  onClick: () => void
}

export default function JetMarker({ aircraft, selected, onClick }: Props) {
  return (
    <Marker
      position={[aircraft.lat, aircraft.lng]}
      icon={createJetIcon(aircraft, selected)}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div className="text-sm font-medium">{aircraft.tailNumber}</div>
        <div className="text-xs text-gray-500 mt-1">
          {aircraft.speed} kts
          {aircraft.altitude > 0 && <> · {aircraft.altitude.toLocaleString()} ft</>}
          {" · "}{aircraft.status}
          {aircraft.owner && <> · {aircraft.owner.name}</>}
        </div>
      </Popup>
    </Marker>
  )
}
