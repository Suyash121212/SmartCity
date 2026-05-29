import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, TrendingUp } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import { timeAgo } from '../../lib/utils'
import { useNavigate } from 'react-router-dom'

const ICONS = {
  status:     <Info size={14} className="text-blue-400" />,
  critical:   <AlertTriangle size={14} className="text-red-400" />,
  escalation: <TrendingUp size={14} className="text-orange-400" />,
}

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, markRead, markAllRead, clearNotifications } = useSocket()
  const navigate = useNavigate()

  const handleClick = (notif) => {
    markRead(notif.id)
    if (notif.issueId) {
      navigate(`/issues/${notif.issueId}`)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden z-40"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-blue-400" />
                <span className="font-semibold text-white text-sm">Notifications</span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={markAllRead} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="Mark all read">
                  <CheckCheck size={14} />
                </button>
                <button onClick={clearNotifications} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors" title="Clear all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={28} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0 ${!notif.read ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">{ICONS[notif.type] || <Info size={14} />}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{timeAgo(notif.time)}</p>
                      </div>
                      {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
