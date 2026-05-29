import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/auth/me')

      setUser(res.data.data)
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email,
      password
    })

    const {
      user,
      accessToken,
      refreshToken
    } = res.data.data

    localStorage.setItem(
      'accessToken',
      accessToken
    )

    localStorage.setItem(
      'refreshToken',
      refreshToken
    )

    setUser(user)

    return user
  }

  const register = async (
    name,
    email,
    password
  ) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password
    })

    const {
      user,
      accessToken,
      refreshToken
    } = res.data.data

    localStorage.setItem(
      'accessToken',
      accessToken
    )

    localStorage.setItem(
      'refreshToken',
      refreshToken
    )

    setUser(user)

    return user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {}

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me')

      setUser(res.data.data)

      return res.data.data
    } catch (error) {
      console.error(error)
    }
  }

  const isProfileComplete =
    user?.profileComplete ||
    user?.role === 'AUTHORITY' ||
    user?.role === 'ADMIN'

  const value = {
    user,
    setUser,
    loading,
    login,
    register,
    logout,
    loadUser,
    refreshUser,
    isProfileComplete
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return ctx
}