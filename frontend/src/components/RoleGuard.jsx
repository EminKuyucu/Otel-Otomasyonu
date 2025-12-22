import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RoleGuard = ({
  children,
  allowedRoles = [],
  fallback = null,
  redirectTo = '/dashboard'
}) => {
  const { role, loading } = useAuth()

  // Show loading while auth state is being initialized
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If no user role, redirect to login
  if (!role) {
    return <Navigate to="/login" replace />
  }

  // Check if user role can access this component
  const canAccess = allowedRoles.includes(role)

  if (!canAccess) {
    if (fallback) {
      return fallback
    }
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default RoleGuard
