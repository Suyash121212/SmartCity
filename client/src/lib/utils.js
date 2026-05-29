import { formatDistanceToNow, format } from 'date-fns'

export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true })
export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy, hh:mm a')
export const formatShortDate = (date) => format(new Date(date), 'dd MMM yyyy')

export const STATUS_CONFIG = {
  REPORTED:    { label: 'Reported',    color: 'text-gray-400',   bg: 'bg-gray-500/20',   dot: 'bg-gray-400' },
  IN_REVIEW:   { label: 'In Review',   color: 'text-blue-400',   bg: 'bg-blue-500/20',   dot: 'bg-blue-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/20', dot: 'bg-yellow-400' },
  RESOLVED:    { label: 'Resolved',    color: 'text-green-400',  bg: 'bg-green-500/20',  dot: 'bg-green-400' },
  REJECTED:    { label: 'Rejected',    color: 'text-red-400',    bg: 'bg-red-500/20',    dot: 'bg-red-400' },
}

export const PRIORITY_CONFIG = {
  LOW:      { label: 'Low',      color: 'text-gray-400',   bg: 'bg-gray-500/20'   },
  MEDIUM:   { label: 'Medium',   color: 'text-blue-400',   bg: 'bg-blue-500/20'   },
  HIGH:     { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-500/20' },
  CRITICAL: { label: 'Critical', color: 'text-red-400',    bg: 'bg-red-500/20'    },
}

export const CATEGORY_CONFIG = {
  ROAD:        { label: 'Roads',       icon: '🛣️',  color: 'text-orange-400' },
  SANITATION:  { label: 'Sanitation',  icon: '🗑️',  color: 'text-green-400'  },
  WATER:       { label: 'Water',       icon: '💧',  color: 'text-blue-400'   },
  ELECTRICITY: { label: 'Electricity', icon: '⚡',  color: 'text-yellow-400' },
  OTHER:       { label: 'Other',       icon: '📋',  color: 'text-gray-400'   },
}

export const PRIORITY_MARKER_COLORS = {
  LOW:      '#6b7280',
  MEDIUM:   '#3b82f6',
  HIGH:     '#f97316',
  CRITICAL: '#ef4444',
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')
