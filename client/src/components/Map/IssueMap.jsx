import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Link } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge'
import { PRIORITY_MARKER_COLORS, CATEGORY_CONFIG } from '../../lib/utils'

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const createCustomIcon = (priority, category) => {
  const color = PRIORITY_MARKER_COLORS[priority] || '#6b7280'
  const cat = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:36px;height:36px;">
        <div style="
          width:36px;height:36px;border-radius:50% 50% 50% 0;
          background:${color};transform:rotate(-45deg);
          border:2px solid rgba(255,255,255,0.3);
          box-shadow:0 4px 12px ${color}60;
        "></div>
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-60%);
          font-size:14px;line-height:1;
        ">${cat.icon}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  })
}

function FlyToLocation({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function IssueMap({ issues = [], center, height = '500px', onMarkerClick }) {
  const defaultCenter = [12.9716, 77.5946] // Bangalore

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-gray-700/50">
      <MapContainer
        center={center || defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {center && <FlyToLocation center={center} />}

        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.lat, issue.lng]}
            icon={createCustomIcon(issue.priority, issue.category)}
            eventHandlers={{ click: () => onMarkerClick?.(issue) }}
          >
            <Popup>
              <div className="min-w-48">
                <p className="font-semibold text-sm mb-1">{issue.title}</p>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={issue.status} size="xs" />
                </div>
                {issue.id && (
                  <Link
                    to={`/issues/${issue.id}`}
                    className="text-blue-400 text-xs hover:underline"
                  >
                    View details →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
