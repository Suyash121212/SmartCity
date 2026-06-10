import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import Navbar from './components/Navbar'
import { PageLoader } from './components/ui/Spinner'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CompleteProfile from './pages/CompleteProfile'
import ReportIssue from './pages/ReportIssue'
import IssueDetail from './pages/IssueDetail'
import DemoIssueDetail from './pages/DemoIssueDetail'
import HowItWorks from './pages/HowItWorks'
import About from './pages/About'
import MyIssues from './pages/MyIssues'
import MapView from './pages/MapView'
import AuthDashboard from './pages/AuthDashboard'
import AdminPanel from './pages/AdminPanel'

// Route guards
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) return <Navigate to="/" replace />
  return children
}

// Guard: citizen must complete profile before reporting
const ProfileRequiredRoute = ({ children }) => {
  const { user, loading, isProfileComplete } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!isProfileComplete) return <Navigate to="/complete-profile" replace />
  return children
}

// Auto-redirect incomplete citizen profiles
function ProfileGuard() {
  const { user, loading, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const exemptPaths = ['/login', '/register', '/complete-profile', '/map', '/']

  useEffect(() => {
    if (loading) return
    if (!user) return
    if (user.role === 'CITIZEN' && !isProfileComplete) {
      if (!exemptPaths.includes(location.pathname)) {
        navigate('/complete-profile', { replace: true })
      }
    }
  }, [user, loading, isProfileComplete, location.pathname])

  return null
}

function AppRoutes() {
  const { loading } = useAuth()
  if (loading) return <PageLoader />

  return (
    <>
      <ProfileGuard />
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/issues/:id" element={<IssueDetail />} />
        <Route path="/demo/:slug" element={<DemoIssueDetail />} />

        {/* Guest only */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

        {/* Profile completion — logged in but incomplete */}
        <Route path="/complete-profile" element={
          <ProtectedRoute roles={['CITIZEN']}>
            <CompleteProfile />
          </ProtectedRoute>
        } />

        {/* Citizen — requires complete profile */}
        <Route path="/report" element={<ProfileRequiredRoute><ReportIssue /></ProfileRequiredRoute>} />
        <Route path="/my-issues" element={<ProfileRequiredRoute><MyIssues /></ProfileRequiredRoute>} />

        {/* Authority + Admin */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['AUTHORITY', 'ADMIN']}><AuthDashboard /></ProtectedRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />

      

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
