import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, CheckCircle, Clock, AlertTriangle, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import Spinner from '../components/ui/Spinner'
import Modal from '../components/ui/Modal'
import StatCard from '../components/ui/StatCard'
import { CATEGORY_CONFIG, timeAgo, formatDate } from '../lib/utils'
import { useAuth } from '../context/AuthContext'

const STATUSES = ['ALL', 'REPORTED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']
const STATUS_TRANSITIONS = ['IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

export default function AuthDashboard() {
  const { user } = useAuth()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [updateModal, setUpdateModal] = useState(false)
  const [updateForm, setUpdateForm] = useState({ status: 'IN_REVIEW', note: '' })
  const [updating, setUpdating] = useState(false)
  const [stats, setStats] = useState({})

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const params = { limit: 50, sortBy: 'createdAt', order: 'desc' }
      if (status !== 'ALL') params.status = status
      if (search) params.search = search
      const res = await api.get('/issues', { params })
      setIssues(res.data.data)
    } catch {}
    finally { setLoading(false) }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/issues', { params: { limit: 200 } })
      const all = res.data.data
      setStats({
        total: all.length,
        resolved: all.filter(i => i.status === 'RESOLVED').length,
        pending: all.filter(i => ['REPORTED', 'IN_REVIEW'].includes(i.status)).length,
        critical: all.filter(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED').length,
      })
    } catch {}
  }

  useEffect(() => { fetchIssues() }, [status, search])
  useEffect(() => { fetchStats() }, [])

  const handleUpdateStatus = async () => {
    if (!selected || !updateForm.note.trim()) { toast.error('Please add a resolution note'); return }
    setUpdating(true)
    try {
      await api.patch(`/issues/${selected.id}/status`, updateForm)
      toast.success('Status updated successfully')
      setUpdateModal(false)
      setSelected(null)
      fetchIssues()
      fetchStats()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">Authority Dashboard</h1>
          <p className="text-gray-400 mt-1">
            {user?.department || 'All Departments'}
            {user?.city && (
              <span className="ml-2 text-blue-400 text-sm">
                📍 {user.city?.name} → {user.zone?.name}
              </span>
            )}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Issues" value={stats.total || 0} color="blue" delay={0} />
          <StatCard icon="✅" label="Resolved" value={stats.resolved || 0} color="green" delay={0.1} />
          <StatCard icon="⏳" label="Pending Review" value={stats.pending || 0} color="orange" delay={0.2} />
          <StatCard icon="🚨" label="Critical Active" value={stats.critical || 0} color="red" delay={0.3} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}>
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Issues Table */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="bg-gray-900/60 border border-gray-700/40 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Issue', 'Category', 'Priority', 'Status', 'Location', 'Reported', 'Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {issues.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-500">No issues found</td></tr>
                  ) : issues.map((issue, i) => {
                    const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER
                    return (
                      <motion.tr
                        key={issue.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-white line-clamp-1">{issue.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{issue.user?.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{cat.icon} <span className={`text-xs ${cat.color}`}>{cat.label}</span></span>
                        </td>
                        <td className="px-4 py-3"><PriorityBadge priority={issue.priority} /></td>
                        <td className="px-4 py-3"><StatusBadge status={issue.status} /></td>
                        <td className="px-4 py-3">
                          {issue.city ? (
                            <span className="text-xs text-blue-400">{issue.city.name} → {issue.zone?.name}</span>
                          ) : <span className="text-xs text-gray-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(issue.createdAt)}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => { setSelected(issue); setUpdateForm({ status: 'IN_REVIEW', note: '' }); setUpdateModal(true) }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            Update Status
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      <Modal isOpen={updateModal} onClose={() => setUpdateModal(false)} title="Update Issue Status">
        {selected && (
          <div className="p-6 space-y-4">
            <div className="bg-gray-800/50 rounded-xl p-3">
              <p className="text-sm font-medium text-white">{selected.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={selected.status} size="xs" />
                <PriorityBadge priority={selected.priority} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_TRANSITIONS.map(s => (
                  <button key={s} onClick={() => setUpdateForm(f => ({ ...f, status: s }))}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                      updateForm.status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Resolution Note <span className="text-red-400">*</span>
              </label>
              <textarea
                value={updateForm.note}
                onChange={e => setUpdateForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Describe the action taken or current status..."
                className="input-field resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setUpdateModal(false)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleUpdateStatus} disabled={updating || !updateForm.note.trim()} className="flex-1 btn-primary">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
