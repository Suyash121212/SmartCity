import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import IssueCard from '../components/IssueCard/IssueCard'
import Spinner from '../components/ui/Spinner'
import StatCard from '../components/ui/StatCard'

const STATUSES = ['ALL', 'REPORTED', 'IN_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']

export default function MyIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')
  const [stats, setStats] = useState({})

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true)
      try {
        // Fetch filtered issues
        const params = { limit: 50 }
        if (status !== 'ALL') params.status = status
        const res = await api.get('/issues/my', { params })
        setIssues(res.data.data || [])

        // Always fetch all issues for stats (no status filter)
        const allRes = await api.get('/issues/my', { params: { limit: 200 } })
        const allIssues = allRes.data.data || []
        setStats({
          total: allIssues.length,
          resolved: allIssues.filter(i => i.status === 'RESOLVED').length,
          pending: allIssues.filter(i => ['REPORTED', 'IN_REVIEW', 'IN_PROGRESS'].includes(i.status)).length,
          critical: allIssues.filter(i => i.priority === 'CRITICAL').length,
        })
      } catch (err) {
        console.error('Failed to fetch my issues:', err.response?.data || err.message)
        setIssues([])
      } finally {
        setLoading(false)
      }
    }
    fetchIssues()
  }, [status])

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">My Issues</h1>
              <p className="text-gray-400 mt-1">Track all your reported civic issues</p>
            </div>
            <Link to="/report" className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Report New
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon="📋" label="Total Reported" value={stats.total || 0} color="blue" delay={0} />
          <StatCard icon="✅" label="Resolved" value={stats.resolved || 0} color="green" delay={0.1} />
          <StatCard icon="⏳" label="Pending" value={stats.pending || 0} color="orange" delay={0.2} />
          <StatCard icon="🔴" label="Critical" value={stats.critical || 0} color="red" delay={0.3} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                status === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s === 'ALL' ? 'All Issues' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No issues found</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">
              {status === 'ALL' ? "You haven't reported any issues yet" : `No ${status.replace('_', ' ').toLowerCase()} issues`}
            </p>
            <Link to="/report" className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Report Your First Issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue, i) => (
              <IssueCard key={issue.id} issue={issue} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
