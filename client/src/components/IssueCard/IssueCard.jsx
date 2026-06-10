import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, MessageSquare, ThumbsUp, Clock, ChevronRight } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge'
import PriorityBadge from '../ui/PriorityBadge'
import { CATEGORY_CONFIG, timeAgo } from '../../lib/utils'

export default function IssueCard({ issue, index = 0, onUpvote, isUpvoted, disableLink }) {
  const cat = CATEGORY_CONFIG[issue.category] || CATEGORY_CONFIG.OTHER
  const LinkOrDiv = disableLink ? 'div' : Link

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-gray-900/60 border border-gray-700/40 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:bg-gray-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
    >
      {/* Photo */}
      {issue.photoUrl && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
            <span className="text-lg">{cat.icon}</span>
            <span className={`text-xs font-semibold ${cat.color}`}>{cat.label}</span>
          </div>
          {issue.aiAnalysis && (
            <div className="absolute top-2 right-2 bg-purple-500/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full font-medium">
              ✨ AI Analyzed
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {!issue.photoUrl && <span className="text-lg">{cat.icon}</span>}
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>
        </div>

        {/* Title */}
        <LinkOrDiv to={disableLink ? undefined : `/issues/${issue.id}`}>
          <h3 className="font-semibold text-white text-sm leading-snug mb-1.5 group-hover:text-blue-400 transition-colors line-clamp-2">
            {issue.title}
          </h3>
        </LinkOrDiv>

        {/* Description */}
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
          {issue.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
          {(issue.city || issue.zone) && (
            <span className="flex items-center gap-1 text-blue-400/70">
              <MapPin size={11} />
              {issue.city?.name}{issue.zone ? ` → ${issue.zone.name}` : ''}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} /> {timeAgo(issue.createdAt)}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
              onClick={(e) => { e.preventDefault(); onUpvote?.(issue.id) }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                isUpvoted ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
              }`}
            >
              <ThumbsUp size={13} className={isUpvoted ? 'fill-blue-400' : ''} />
              {issue.upvoteCount || issue._count?.upvotes || 0}
            </button>

            {/* Comments */}
            <LinkOrDiv to={disableLink ? undefined : `/issues/${issue.id}`} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
              <MessageSquare size={13} />
              {issue._count?.comments || 0}
            </LinkOrDiv>
          </div>

          {/* Reporter */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {issue.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-xs text-gray-600 max-w-20 truncate">{issue.user?.name}</span>
            <LinkOrDiv to={disableLink ? undefined : `/issues/${issue.id}`} className="text-gray-600 hover:text-blue-400 transition-colors">
              <ChevronRight size={14} />
            </LinkOrDiv>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
