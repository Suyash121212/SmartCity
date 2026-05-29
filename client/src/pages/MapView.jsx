import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Filter } from 'lucide-react'
import api from '../lib/api'
import IssueMap from '../components/Map/IssueMap'
import Spinner from '../components/ui/Spinner'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import { CATEGORY_CONFIG, timeAgo } from '../lib/utils'
import { Link } from 'react-router-dom'

export default function MapView() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('ALL')

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = { limit: 200 }
        if (category !== 'ALL') params.category = category
        const res = await api.get('/issues', { params })
        setIssues(res.data.data)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [category])

  const CATEGORIES = ['ALL', 'ROAD', 'SANITATION', 'WATER', 'ELECTRICITY', 'OTHER']

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <MapPin className="text-blue-400" /> Issue Map
          </h1>
          <p className="text-gray-400 mt-1">Live view of all reported issues across the city</p>
        </motion.div>

        {/* Category filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === c ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {c === 'ALL' ? '🗺️ All' : `${CATEGORY_CONFIG[c]?.icon} ${CATEGORY_CONFIG[c]?.label}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Map */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="h-[600px] bg-gray-900 rounded-2xl flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : (
              <IssueMap
                issues={issues}
                height="600px"
                onMarkerClick={setSelected}
              />
            )}
            <p className="text-xs text-gray-600 mt-2 text-center">
              Showing {issues.length} issues • Click a marker for details
            </p>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Legend */}
            <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Priority Legend</h3>
              {[
                { label: 'Critical', color: 'bg-red-500' },
                { label: 'High', color: 'bg-orange-500' },
                { label: 'Medium', color: 'bg-blue-500' },
                { label: 'Low', color: 'bg-gray-500' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Selected issue */}
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/60 border border-blue-500/30 rounded-2xl p-4"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-lg">{CATEGORY_CONFIG[selected.category]?.icon}</span>
                  <StatusBadge status={selected.status} size="xs" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">{selected.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{timeAgo(selected.createdAt)}</p>
                <PriorityBadge priority={selected.priority} />
                <Link
                  to={`/issues/${selected.id}`}
                  className="mt-3 block text-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View full details →
                </Link>
              </motion.div>
            )}

            {/* Stats */}
            <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Category Breakdown</h3>
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                const count = issues.filter(i => i.category === key).length
                const pct = issues.length > 0 ? (count / issues.length) * 100 : 0
                return (
                  <div key={key} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{cfg.icon} {cfg.label}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
