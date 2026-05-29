import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ChevronDown, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function CompleteProfile() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [zones, setZones] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [loadingCities, setLoadingCities] = useState(true)
  const [loadingZones, setLoadingZones] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [noAuthority, setNoAuthority] = useState(false)

  // Load cities on mount
  useEffect(() => {
    api.get('/cities')
      .then(res => setCities(res.data.data))
      .catch(() => toast.error('Failed to load cities'))
      .finally(() => setLoadingCities(false))
  }, [])

  // Load zones when city changes
  useEffect(() => {
    if (!selectedCity) { setZones([]); setSelectedZone(''); return }
    setLoadingZones(true)
    setSelectedZone('')
    setNoAuthority(false)
    api.get(`/cities/${selectedCity}/zones`)
      .then(res => setZones(res.data.data))
      .catch(() => toast.error('Failed to load zones'))
      .finally(() => setLoadingZones(false))
  }, [selectedCity])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCity || !selectedZone) {
      toast.error('Please select both city and zone')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.patch('/profile/complete', {
        cityId: selectedCity,
        zoneId: selectedZone,
      })
      if (res.data.warning) {
        setNoAuthority(true)
        toast('Profile saved! Note: No authority assigned to your area yet.', { icon: '⚠️', duration: 5000 })
      } else {
        toast.success('Profile completed! Welcome to SmartCity.')
      }
      await refreshUser()
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCityName = cities.find(c => c.id === selectedCity)?.name
  const selectedZoneName = zones.find(z => z.id === selectedZone)?.name

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <MapPin size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Select your city and zone so we can route your complaints to the right authority.
          </p>
        </div>

        {/* Welcome message */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6 text-center">
          <p className="text-blue-300 text-sm">
            👋 Welcome, <span className="font-semibold">{user?.name}</span>! One last step before you can report issues.
          </p>
        </div>

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* City selector */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Select City <span className="text-red-400">*</span>
              </label>
              {loadingCities ? (
                <div className="input-field flex items-center gap-2 text-gray-500">
                  <Loader2 size={14} className="animate-spin" /> Loading cities...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    className="input-field appearance-none pr-10 cursor-pointer"
                    required
                  >
                    <option value="">-- Select a city --</option>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>{city.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Zone selector */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Select Zone / Area <span className="text-red-400">*</span>
              </label>
              {loadingZones ? (
                <div className="input-field flex items-center gap-2 text-gray-500">
                  <Loader2 size={14} className="animate-spin" /> Loading zones...
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedZone}
                    onChange={e => setSelectedZone(e.target.value)}
                    className="input-field appearance-none pr-10 cursor-pointer disabled:opacity-50"
                    disabled={!selectedCity || zones.length === 0}
                    required
                  >
                    <option value="">
                      {!selectedCity ? '-- Select a city first --' : zones.length === 0 ? '-- No zones available --' : '-- Select a zone --'}
                    </option>
                    {zones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Preview */}
            {selectedCityName && selectedZoneName && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3"
              >
                <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-gray-400">Your area: </span>
                  <span className="text-white font-semibold">{selectedCityName}</span>
                  <span className="text-gray-500 mx-1">→</span>
                  <span className="text-white font-semibold">{selectedZoneName}</span>
                </div>
              </motion.div>
            )}

            {/* No authority warning */}
            {noAuthority && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={15} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-yellow-300 text-xs">
                  No authority is currently assigned to this area. Your issues will be queued until one is assigned.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !selectedCity || !selectedZone}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {submitting
                ? <><Loader2 size={18} className="animate-spin" /> Saving...</>
                : <><CheckCircle2 size={18} /> Complete Profile</>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          You can update your area later from your profile settings.
        </p>
      </motion.div>
    </div>
  )
}
