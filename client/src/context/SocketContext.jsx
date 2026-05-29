import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [liveIssues, setLiveIssues] = useState([])

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      if (user) {
        socket.emit('join:user', user.id)
        if (user.area) socket.emit('join:area', user.area)
        if (user.role === 'AUTHORITY') socket.emit('join:authority', user.department)
      }
    })

    socket.on('disconnect', () => setConnected(false))

    // New issue in feed
    socket.on('issue:new', (issue) => {
      setLiveIssues(prev => [issue, ...prev.slice(0, 49)])
    })

    // Status update for citizen
    socket.on('issue:status', ({ issue, update }) => {
      addNotification({
        type: 'status',
        title: 'Issue Updated',
        message: `Your issue "${issue.title}" is now ${update.status.replace('_', ' ')}`,
        issueId: issue.id,
      })
    })

    // Critical issue alert for authorities
    socket.on('issue:critical', (issue) => {
      if (user?.role === 'AUTHORITY' || user?.role === 'ADMIN') {
        addNotification({
          type: 'critical',
          title: '🚨 Critical Issue Reported',
          message: `${issue.title} — ${issue.area || 'Unknown area'}`,
          issueId: issue.id,
        })
      }
    })

    // Escalation
    socket.on('issue:escalated', ({ issue }) => {
      if (user?.role === 'AUTHORITY' || user?.role === 'ADMIN') {
        addNotification({
          type: 'escalation',
          title: '⚠️ Issue Escalated',
          message: `Citizen frustration detected on: "${issue.title}"`,
          issueId: issue.id,
        })
      }
    })

    return () => socket.disconnect()
  }, [user])

  const addNotification = (notif) => {
    const id = Date.now()
    setNotifications(prev => [{ ...notif, id, read: false, time: new Date() }, ...prev.slice(0, 19)])
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearNotifications = () => setNotifications([])

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      notifications,
      liveIssues,
      addNotification,
      markRead,
      markAllRead,
      clearNotifications,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
