import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts'
import { Plus, Users, AlertTriangle, Loader2, MapPin, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import StatCard from '../components/ui/StatCard'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import { timeAgo } from '../lib/utils'

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AdminPanel() {
  const [analytics, setAnalytics] = useState(null)
  const [escalated, setEscalated] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [createModal, setCreateModal] = useState(false)
  const [cities, setCities] = useState([])
  const [zones, setZones] = useState([])
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', department: '', cityId: '', zoneId: '' })
  const [creating, setCreating] = useState(false)
  const [loadingZones, setLoadingZones] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [analyticsRes, escalatedRes, citiesRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/issues/escalated'),
          api.get('/cities'),
        ])
        setAnalytics(analyticsRes.data.data)
        setEscalated(escalatedRes.data.data)
        setCities(citiesRes.data.data)
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  // Load zones when city changes in authority form
  useEffect(() => {
    if (!authForm.cityId) { setZones([]); setAuthForm(f => ({ ...f, zoneId: '' })); return }
    setLoadingZones(true)
    api.get(`/cities/${authForm.cityId}/zones`)
      .then(res => setZones(res.data.data))
      .catch(() => toast.error('Failed to load zones'))
      .finally(() => setLoadingZones(false))
  }, [authForm.cityId])

  const handleCreateAuthority = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await api.post('/admin/authorities', authForm)
      toast.success('Authority account created')
      setCreateModal(false)
      setAuthForm({ name: '', email: '', password: '', department: '', cityId: '', zoneId: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account')
    } finally { setCreating(false) }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center"><Spinner size="lg" /></div>

  const { overview, byCategory, byStatus, byPriority, trend, recentIssues } = analytics || {}
  const TABS = ['overview', 'analytics', 'escalated', 'authorities', 'cities']

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 mt-1">Platform-wide analytics and management</p>
            </div>
            <button onClick={() => setCreateModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Add Authority
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-800 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              {tab === 'cities' ? '🏙️ Cities & Zones' : tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon="📋" label="Total Issues" value={overview?.totalIssues || 0} color="blue" delay={0} />
              <StatCard icon="✅" label="Resolved" value={overview?.resolvedIssues || 0} sub={`${overview?.resolutionRate || 0}% rate`} color="green" delay={0.1} />
              <StatCard icon="⏳" label="Pending" value={overview?.pendingIssues || 0} color="orange" delay={0.2} />
              <StatCard icon="🚨" label="Critical" value={overview?.criticalIssues || 0} color="red" delay={0.3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon="👥" label="Citizens" value={overview?.totalUsers || 0} color="purple" delay={0.4} />
              <StatCard icon="⚡" label="Avg Resolution" value={`${overview?.avgResolutionHours || 0}h`} color="blue" delay={0.5} />
              <StatCard icon="📈" label="Resolution Rate" value={`${overview?.resolutionRate || 0}%`} color="green" delay={0.6} />
            </div>
            <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Recent Issues</h3>
              <div className="space-y-3">
                {recentIssues?.map(issue => (
                  <div key={issue.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium line-clamp-1">{issue.title}</p>
                      <p className="text-xs text-gray-500">{issue.user?.name} • {timeAgo(issue.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={issue.priority} />
                      <StatusBadge status={issue.status} size="xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Issues — Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} name="Issues" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm">By Category</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                      {byCategory?.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm">By Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={byStatus} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 10 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-4 text-sm">By Priority</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={byPriority}>
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                      {byPriority?.map((entry, i) => {
                        const colors = { LOW: '#6b7280', MEDIUM: '#3b82f6', HIGH: '#f97316', CRITICAL: '#ef4444' }
                        return <Cell key={i} fill={colors[entry.name] || '#3b82f6'} />
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Escalated Tab */}
        {activeTab === 'escalated' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-orange-400" />
              <h2 className="font-semibold text-white">High Priority & Escalated Issues</h2>
              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">{escalated.length}</span>
            </div>
            <div className="space-y-3">
              {escalated.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No escalated issues 🎉</div>
              ) : escalated.map((issue, i) => (
                <motion.div key={issue.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-gray-900/60 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-1">{issue.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {issue.user?.name} • {timeAgo(issue.createdAt)}
                      {issue.city && <span className="ml-2 text-blue-400">📍 {issue.city.name} → {issue.zone?.name}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} size="xs" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Authorities Tab */}
        {activeTab === 'authorities' && <AuthoritiesList />}

        {/* Cities & Zones Tab */}
        {activeTab === 'cities' && <CitiesManager cities={cities} setCities={setCities} />}
      </div>

      {/* Create Authority Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create Authority Account">
        <form onSubmit={handleCreateAuthority} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Full Name</label>
              <input type="text" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))}
                className="input-field" placeholder="Pune Kothrud Admin" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
              <input type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="admin@city.gov" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
              <input type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="Min. 6 chars" required />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Department</label>
              <input type="text" value={authForm.department} onChange={e => setAuthForm(f => ({ ...f, department: e.target.value }))}
                className="input-field" placeholder="Roads & Infrastructure" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">City <span className="text-red-400">*</span></label>
              <select value={authForm.cityId} onChange={e => setAuthForm(f => ({ ...f, cityId: e.target.value, zoneId: '' }))}
                className="input-field" required>
                <option value="">-- Select City --</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Zone <span className="text-red-400">*</span></label>
              <select value={authForm.zoneId} onChange={e => setAuthForm(f => ({ ...f, zoneId: e.target.value }))}
                className="input-field" required disabled={!authForm.cityId || loadingZones}>
                <option value="">{loadingZones ? 'Loading...' : !authForm.cityId ? '-- Select city first --' : '-- Select Zone --'}</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
          </div>
          {authForm.cityId && authForm.zoneId && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 text-xs text-blue-300 flex items-center gap-2">
              <MapPin size={12} />
              This admin will manage: <strong>{cities.find(c => c.id === authForm.cityId)?.name}</strong> → <strong>{zones.find(z => z.id === authForm.zoneId)?.name}</strong>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={creating} className="flex-1 btn-primary flex items-center justify-center gap-2">
              {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// ── Authorities List ─────────────────────────────────────────────────────────
function AuthoritiesList() {
  const [authorities, setAuthorities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/authorities').then(res => setAuthorities(res.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-blue-400" />
        <h2 className="font-semibold text-white">Authority Accounts ({authorities.length})</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {authorities.map((auth, i) => (
          <motion.div key={auth.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {auth.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{auth.name}</p>
                <p className="text-xs text-gray-500 truncate">{auth.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              {auth.city && (
                <div className="flex items-center gap-1.5 text-blue-400">
                  <MapPin size={11} />
                  <span className="font-medium">{auth.city.name}</span>
                  <span className="text-gray-600">→</span>
                  <span className="font-medium">{auth.zone?.name}</span>
                </div>
              )}
              {auth.department && <p className="text-gray-500">🏢 {auth.department}</p>}
              <p className="text-gray-600">✅ {auth._count?.statusUpdates || 0} issues resolved</p>
            </div>
          </motion.div>
        ))}
        {authorities.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">No authority accounts yet. Create one above.</div>
        )}
      </div>
    </div>
  )
}

// ── Cities & Zones Manager ───────────────────────────────────────────────────
function CitiesManager({ cities, setCities }) {
  const [selectedCity, setSelectedCity] = useState(null)
  const [zones, setZones] = useState([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [newCityName, setNewCityName] = useState('')
  const [newZoneName, setNewZoneName] = useState('')
  const [addingCity, setAddingCity] = useState(false)
  const [addingZone, setAddingZone] = useState(false)

  const loadZones = async (city) => {
    setSelectedCity(city)
    setLoadingZones(true)
    try {
      const res = await api.get(`/cities/${city.id}/zones`)
      setZones(res.data.data)
    } catch { toast.error('Failed to load zones') }
    finally { setLoadingZones(false) }
  }

  const handleAddCity = async (e) => {
    e.preventDefault()
    if (!newCityName.trim()) return
    setAddingCity(true)
    try {
      const res = await api.post('/cities', { name: newCityName.trim() })
      setCities(prev => [...prev, res.data.data])
      setNewCityName('')
      toast.success(`City "${res.data.data.name}" added`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add city')
    } finally { setAddingCity(false) }
  }

  const handleAddZone = async (e) => {
    e.preventDefault()
    if (!newZoneName.trim() || !selectedCity) return
    setAddingZone(true)
    try {
      const res = await api.post(`/cities/${selectedCity.id}/zones`, { name: newZoneName.trim() })
      setZones(prev => [...prev, res.data.data])
      setNewZoneName('')
      toast.success(`Zone "${res.data.data.name}" added`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add zone')
    } finally { setAddingZone(false) }
  }

  const handleDeleteCity = async (cityId, cityName) => {
    if (!confirm(`Delete city "${cityName}" and all its zones?`)) return
    try {
      await api.delete(`/cities/${cityId}`)
      setCities(prev => prev.filter(c => c.id !== cityId))
      if (selectedCity?.id === cityId) { setSelectedCity(null); setZones([]) }
      toast.success('City deleted')
    } catch { toast.error('Failed to delete city') }
  }

  const handleDeleteZone = async (zoneId, zoneName) => {
    if (!confirm(`Delete zone "${zoneName}"?`)) return
    try {
      await api.delete(`/cities/zones/${zoneId}`)
      setZones(prev => prev.filter(z => z.id !== zoneId))
      toast.success('Zone deleted')
    } catch { toast.error('Failed to delete zone') }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Building2 size={18} className="text-blue-400" />
        <h2 className="font-semibold text-white">Cities & Zones Management</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cities panel */}
        <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Cities ({cities.length})</h3>
          <form onSubmit={handleAddCity} className="flex gap-2 mb-4">
            <input type="text" value={newCityName} onChange={e => setNewCityName(e.target.value)}
              placeholder="New city name..." className="input-field flex-1 py-2 text-sm" />
            <button type="submit" disabled={addingCity || !newCityName.trim()} className="btn-primary px-3 py-2 text-sm">
              {addingCity ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </form>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {cities.map(city => (
              <div key={city.id}
                onClick={() => loadZones(city)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  selectedCity?.id === city.id ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                }`}>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={selectedCity?.id === city.id ? 'text-blue-400' : 'text-gray-500'} />
                  <span className="text-sm text-white font-medium">{city.name}</span>
                  <span className="text-xs text-gray-500">{city._count?.zones || 0} zones</span>
                </div>
                <button onClick={e => { e.stopPropagation(); handleDeleteCity(city.id, city.name) }}
                  className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {cities.length === 0 && <p className="text-gray-600 text-sm text-center py-4">No cities yet</p>}
          </div>
        </div>

        {/* Zones panel */}
        <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">
            {selectedCity ? `Zones in ${selectedCity.name} (${zones.length})` : 'Select a city to manage zones'}
          </h3>
          {selectedCity && (
            <form onSubmit={handleAddZone} className="flex gap-2 mb-4">
              <input type="text" value={newZoneName} onChange={e => setNewZoneName(e.target.value)}
                placeholder={`New zone in ${selectedCity.name}...`} className="input-field flex-1 py-2 text-sm" />
              <button type="submit" disabled={addingZone || !newZoneName.trim()} className="btn-primary px-3 py-2 text-sm">
                {addingZone ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              </button>
            </form>
          )}
          {loadingZones ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {zones.map(zone => (
                <div key={zone.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/50 border border-transparent">
                  <span className="text-sm text-white">{zone.name}</span>
                  <button onClick={() => handleDeleteZone(zone.id, zone.name)}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {selectedCity && zones.length === 0 && !loadingZones && (
                <p className="text-gray-600 text-sm text-center py-4">No zones yet. Add one above.</p>
              )}
              {!selectedCity && <p className="text-gray-600 text-sm text-center py-8">← Click a city to see its zones</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
