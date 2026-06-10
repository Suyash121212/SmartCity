import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, ThumbsUp, MessageSquare, ChevronLeft, Sparkles, User, Info } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import IssueMap from '../components/Map/IssueMap'
import { CATEGORY_CONFIG, formatDate, timeAgo } from '../lib/utils'
import { getDemoIssue } from '../data/demoIssues'

const SENTIMENT_COLORS = {
  POSITIVE: 'text-green-400', NEUTRAL: 'text-gray-400',
  NEGATIVE: 'text-orange-400', FRUSTRATED: 'text-red-400',
}

export default function DemoIssueDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const issue = getDemoIssue(slug)

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Demo issue not found</p>
          <Link to="/" className="text-blue-400 text-sm mt-2 block hover:underline">← Back to feed</Link>
        </div>
      </div>
    )
  }

  const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER

  return (
    <div className="min-h-screen bg-gray-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">

        {/* Demo banner */}
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5 mb-5 text-sm text-yellow-300">
          <Info size={14} className="flex-shrink-0" />
          <span>This is a <strong>demo issue</strong> — displayed statically for preview purposes only.</span>
        </div>

        <Link to="/" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Feed
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl overflow-hidden">
              {issue.photoUrl && (
                <div className="relative h-64">
                  <img src={issue.photoUrl} alt={issue.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-purple-500/80 backdrop-blur-sm rounded-full px-3 py-1">
                    <Sparkles size={12} className="text-white" />
                    <span className="text-white text-xs font-medium">AI Analyzed</span>
                  </div>
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
                  {issue.city && (
                    <span className="flex items-center gap-1.5 text-blue-400/70">
                      <MapPin size={14} />
                      {issue.city.name} → {issue.zone?.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5"><Clock size={14} />{timeAgo(issue.createdAt)}</span>
                  <span className="flex items-center gap-1.5"><User size={14} />{issue.user?.name}</span>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 text-sm">
                    <ThumbsUp size={15} />
                    {issue.upvoteCount} Upvotes
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 text-sm">
                    <MessageSquare size={15} />
                    {issue._count?.comments} Comments
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Analysis */}
            {issue.aiAnalysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-purple-400" />
                  <h3 className="font-semibold text-purple-300">AI Analysis</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Issue Type</p>
                    <p className="text-white font-medium">{issue.aiAnalysis.issue_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Severity</p>
                    <p className="text-white font-medium capitalize">{issue.aiAnalysis.severity}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-gray-500 text-xs">AI Description</p>
                    <p className="text-gray-300">{issue.aiAnalysis.description}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Comments */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                Comments ({issue.comments?.length || 0})
              </h3>
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
                          <span className={`text-xs ${SENTIMENT_COLORS[c.sentiment]}`}>{c.sentiment.toLowerCase()}</span>
                        )}
                        <span className="text-xs text-gray-600 ml-auto">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4 text-center">
                💬 Login to add a comment on real issues
              </p>
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
              <p className="text-xs text-gray-600 mt-1.5">{issue.lat.toFixed(5)}, {issue.lng.toFixed(5)}</p>
            </motion.div>

            {/* Status Timeline */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-white mb-4">Status Timeline</h3>
              <div className="space-y-3">
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
                      {update.authority?.name !== 'System' && (
                        <p className="text-xs text-blue-400 mt-0.5">by {update.authority.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-gray-900/60 border border-gray-700/40 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white">Details</h3>
              {[
                ['Category', `${cat.icon} ${cat.label}`],
                ['Reported', formatDate(issue.createdAt)],
                ['Issue ID', `#${issue.id.replace('demo-', 'DEMO').toUpperCase()}`],
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
