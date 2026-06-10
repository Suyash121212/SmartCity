import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Menu, X, MapPin, LogOut, User, LayoutDashboard, Plus, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import NotificationPanel from './Notifications/NotificationPanel'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { connected, notifications } = useSocket()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const unread = notifications.filter(n => !n.read).length

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinks = [
    { to: '/', label: 'Live Feed' },
    { to: '/map', label: 'Issue Map' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/about', label: 'About' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-none">SmartCity</span>
              <span className="block text-xs text-gray-500 leading-none">Issue Portal</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Connection indicator */}
            <div className={`hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${connected ? 'text-green-400 bg-green-500/10' : 'text-gray-500 bg-gray-800'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              {connected ? 'Live' : 'Offline'}
            </div>

            {user ? (
              <>
                {/* Report Issue button */}
                {user.role === 'CITIZEN' && (
                  <Link to="/report" className="hidden sm:flex items-center gap-1.5 btn-primary text-sm py-1.5">
                    <Plus size={15} />
                    Report Issue
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  >
                    <Bell size={18} />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm text-gray-300 max-w-24 truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                            {user.role}
                          </span>
                          {user.city && (
                            <p className="text-xs text-blue-400/70 mt-1">
                              📍 {user.city.name} → {user.zone?.name}
                            </p>
                          )}
                          {user.role === 'CITIZEN' && !user.profileComplete && (
                            <p className="text-xs text-yellow-400 mt-1">⚠️ Profile incomplete</p>
                          )}
                        </div>
                        <div className="py-1">
                          {user.role === 'CITIZEN' && !user.profileComplete && (
                            <Link to="/complete-profile" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                              <MapPin size={15} /> Complete Profile
                            </Link>
                          )}
                          {user.role === 'CITIZEN' && (
                            <Link to="/my-issues" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                              <User size={15} /> My Issues
                            </Link>
                          )}
                          {(user.role === 'AUTHORITY' || user.role === 'ADMIN') && (
                            <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                              <LayoutDashboard size={15} /> Dashboard
                            </Link>
                          )}
                          {user.role === 'ADMIN' && (
                            <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
                              <LayoutDashboard size={15} /> Admin Panel
                            </Link>
                          )}
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut size={15} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 bg-gray-950"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to) ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}>
                  {link.label}
                </Link>
              ))}
              {user?.role === 'CITIZEN' && (
                <Link to="/report" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-medium text-blue-400 hover:bg-blue-600/20 transition-colors">
                  + Report Issue
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
