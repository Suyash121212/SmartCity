import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, ThumbsUp, MessageSquare, Download, ChevronLeft, Sparkles, User } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import Spinner from '../components/ui/Spinner'
import IssueMap from '../components/Map/IssueMap'
import { useAuth } from '../context/AuthContext'
import { CATEGORY_CONFIG, formatDate, timeAgo } from '../lib/utils'

const SENTIMENT_COLORS = {
  POSITIVE: 'text-green-400', NEUTRAL: 'text-gray-400',
  NEGATIVE: 'text-orange-400', FRUSTRATED: 'text-red-400',
}

export default function IssueDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await api.get(`/issues/${id}`)
        setIssue(res.data.data)
      } catch {
        toast.error('Issue not found')
      } finally {
        setLoading(false)
      }
    }
    fetchIssue()
  }, [id])

  const handleUpvote = async () => {
    if (!user) { toast.error('Sign in to upvote'); return }
    try {
      const res = await api.post(`/issues/${id}/upvote`)
      setUpvoted(res.data.upvoted)
      setIssue(prev => ({
        ...prev,
        upvoteCount: res.data.upvoted ? (prev.upvoteCount || 0) + 1 : (prev.upvoteCount || 1) - 1,
      }))
    } catch {}
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmittingComment(true)
    try {
      const res = await api.post(`/issues/${id}/comments`, { content: comment })
      setIssue(prev => ({ ...prev, comments: [res.data.data, ...prev.comments] }))
      setComment('')
      toast.success('Comment added')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDownloadReport = async () => {
    setDownloadingReport(true)
    try {
      const res = await api.get(`/issues/${id}/report`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `issue-${id.substring(0, 8)}-report.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setDownloadingReport(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center"><Spinner size="lg" /></div>
  if (!issue) return <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center text-gray-400">Issue not found</div>

  const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Feed
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl overflow-hidden"
            >
              {issue.photoUrl && (
                <div className="relative h-64">
                  <img src={issue.photoUrl} alt={issue.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  {issue.aiAnalysis && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-purple-500/80 backdrop-blur-sm rounded-full px-3 py-1">
                      <Sparkles size={12} className="text-white" />
                      <span className="text-white text-xs font-medium">AI Analyzed</span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <StatusBadge status={issue.status} size="md" />
                  <PriorityBadge priority={issue.priority} />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">{issue.title}</h1>
                <p className="text-gray-400 leading-relaxed">{issue.description}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-800 text-sm text-gray-500">
                  {issue.area && <span className="flex items-center gap-1.5"><MapPin size={14} />{issue.area}</span>}
                  <span className="flex items-center gap-1.5"><Clock size={14} />{timeAgo(issue.createdAt)}</span>
                  <span className="flex items-center gap-1.5"><User size={14} />{issue.user?.name}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      upvoted
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-blue-500/50 hover:text-blue-400'
                    }`}
                  >
                    <ThumbsUp size={15} className={upvoted ? 'fill-blue-400' : ''} />
                    {issue.upvoteCount || 0} Upvotes
                  </button>

                  {(user?.role === 'AUTHORITY' || user?.role === 'ADMIN' || issue.userId === user?.id) && (
                    <button
                      onClick={handleDownloadReport}
                      disabled={downloadingReport}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
                    >
                      <Download size={15} />
                      {downloadingReport ? 'Generating...' : 'PDF Report'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* AI Analysis */}
            {issue.aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-purple-400" />
                  <h3 className="font-semibold text-purple-300">AI Analysis</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {issue.aiAnalysis.issue_type && (
                    <div><p className="text-gray-500 text-xs">Issue Type</p><p className="text-white font-medium">{issue.aiAnalysis.issue_type}</p></div>
                  )}
                  {issue.aiAnalysis.severity && (
                    <div><p className="text-gray-500 text-xs">Severity</p><p className="text-white font-medium capitalize">{issue.aiAnalysis.severity}</p></div>
                  )}
                  {issue.aiAnalysis.description && (
                    <div className="col-span-2 sm:col-span-3"><p className="text-gray-500 text-xs">AI Description</p><p className="text-gray-300">{issue.aiAnalysis.description}</p></div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Comments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5"
            >
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                Comments ({issue.comments?.length || 0})
              </h3>

              {user && (
                <form onSubmit={handleComment} className="mb-5">
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="input-field resize-none mb-2"
                    rows={2}
                  />
                  <button type="submit" disabled={submittingComment || !comment.trim()} className="btn-primary text-sm py-1.5">
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {issue.comments?.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {c.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{c.user?.name}</span>
                        {c.sentiment && (
                          <span className={`text-xs ${SENTIMENT_COLORS[c.sentiment]}`}>
                            {c.sentiment.toLowerCase()}
                          </span>
                        )}
                        <span className="text-xs text-gray-600 ml-auto">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
                {(!issue.comments || issue.comments.length === 0) && (
                  <p className="text-gray-600 text-sm text-center py-4">No comments yet. Be the first!</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Map */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-1.5">
                <MapPin size={14} /> Location
              </h3>
              <IssueMap issues={[issue]} height="220px" />
              <p className="text-xs text-gray-600 mt-1.5">
                {issue.lat.toFixed(5)}, {issue.lng.toFixed(5)}
              </p>
            </motion.div>

            {/* Status Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-4"
            >
              <h3 className="text-sm font-semibold text-white mb-4">Status Timeline</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-0.5" />
                    {issue.updates?.length > 0 && <div className="w-0.5 flex-1 bg-gray-800 mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-xs font-semibold text-gray-300">Issue Reported</p>
                    <p className="text-xs text-gray-600">{formatDate(issue.createdAt)}</p>
                  </div>
                </div>
                {issue.updates?.map((update, i) => (
                  <div key={update.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mt-0.5 ${
                        update.status === 'RESOLVED' ? 'bg-green-500' :
                        update.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                        update.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      {i < issue.updates.length - 1 && <div className="w-0.5 flex-1 bg-gray-800 mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-semibold text-gray-300">{update.status.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{update.note}</p>
                      <p className="text-xs text-gray-600">{formatDate(update.createdAt)}</p>
                      {update.authority && (
                        <p className="text-xs text-blue-400 mt-0.5">by {update.authority.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Issue Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-4 space-y-3"
            >
              <h3 className="text-sm font-semibold text-white">Details</h3>
              {[
                ['Category', `${cat.icon} ${cat.label}`],
                ['Reported', formatDate(issue.createdAt)],
                ['Issue ID', `#${issue.id.substring(0, 8).toUpperCase()}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-300 font-medium">{value}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
