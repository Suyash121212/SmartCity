import { useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(form.email, form.password)

      toast.success(`Welcome back, ${user.name}!`)

      // Force authority to change password
      if (
        user.role === 'AUTHORITY' &&
        user.mustChangePassword
      ) {
        {
          showPasswordModal && (
            <ChangePasswordModal />
          )
        }
        return
      }

      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else if (user.role === 'AUTHORITY') {
        navigate('/dashboard')
      } else if (!user.profileComplete) {
        navigate('/complete-profile')
      } else {
        navigate('/')
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Login failed'
      )
    } finally {
      setLoading(false)
    }
  }

  // const fillDemo = (role) => {
  //   const demos = {
  //     citizen: { email: 'rahul@example.com', password: 'citizen123' },
  //     authority: { email: 'roads@smartcity.gov', password: 'auth123' },
  //     admin: { email: 'admin@smartcity.gov', password: 'admin123' },
  //   }
  //   setForm(demos[role])
  // }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
            <MapPin size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to SmartCity Portal</p>
        </div>

        {/* Demo accounts
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-6">
          <p className="text-xs text-gray-500 mb-2 text-center">Quick demo login:</p>
          <div className="flex gap-2 justify-center">
            {['citizen', 'authority', 'admin'].map(role => (
              <button key={role} onClick={() => fillDemo(role)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg capitalize transition-colors">
                {role}
              </button>
            ))}
          </div>
        </div> */}

        <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 border-t border-gray-800 pt-4 text-center">

            <p className="text-sm text-gray-500">
              Citizen user?{' '}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Create Account
              </Link>
            </p>

            <p className="text-xs text-gray-600 mt-2">
              Authority and Super Admin accounts can only sign in.
            </p>

          </div>
        </div>
      </motion.div>
    </div>
  )
}
