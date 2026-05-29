import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value || null)
  const [locating, setLocating] = useState(false)
  const defaultCenter = [12.9716, 77.5946]

  const handleSelect = (loc) => {
    setPosition(loc)
    onChange(loc)
  }

  const useMyLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        handleSelect(loc)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
          <MapPin size={14} className="text-blue-400" />
          Pin Location <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          {locating ? 'Locating...' : '📍 Use my location'}
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-gray-700 h-56">
        <MapContainer
          center={position ? [position.lat, position.lng] : defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onLocationSelect={handleSelect} />
          {position && <Marker position={[position.lat, position.lng]} />}
        </MapContainer>
      </div>

      {position ? (
        <p className="text-xs text-green-400 flex items-center gap-1">
          ✓ Location pinned: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-gray-500">Click on the map to pin the issue location</p>
      )}
    </div>
  )
}
