import React, { createContext, useContext, useState, useEffect } from 'react'
import { setAuthToken } from '../services/api'
import { ROLES, canAccessRole, getRolePermissions } from '../constants/roles'

// Auth Context
const AuthContext = createContext()

// Re-export roles from constants
export { ROLES } from '../constants/roles'

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        const storedRole = localStorage.getItem('userRole')

        if (storedToken && storedUser && storedRole) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
          setRole(storedRole)
          // Set token for API service
          setAuthToken(storedToken)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear corrupted data
        logout()
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = (token, userData) => {
    try {
      setToken(token)
      setUser(userData)
      setRole(userData.role)

      // Set token for API service
      setAuthToken(token)

      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('userRole', userData.role)
    } catch (error) {
      console.error('Login error:', error)
      logout()
    }
  }

  // Logout function
  const logout = () => {
    setToken(null)
    setUser(null)
    setRole(null)

    // Clear token from API service
    setAuthToken(null)

    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
  }

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return canAccessRole(role, requiredRole)
  }

  // Check if user has any of the required roles
  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.some(requiredRole => hasRole(requiredRole))
  }

  // Get user permissions based on role
  const getPermissions = () => {
    return getRolePermissions(role)
  }

  const value = {
    // State
    user,
    role,
    token,
    loading,

    // Functions
    login,
    logout,
    hasRole,
    hasAnyRole,
    getPermissions,

    // Computed values
    isAuthenticated: !!token,
    isAdmin: role === ROLES.ADMIN,
    isReception: role === ROLES.RECEPTION,
    isOperations: role === ROLES.OPERATIONS
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
