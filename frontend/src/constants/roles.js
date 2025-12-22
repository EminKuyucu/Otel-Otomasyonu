// Role constants for RBAC system
export const ROLES = {
  ADMIN: 'ADMIN',
  RECEPTION: 'RECEPTION',
  OPERATIONS: 'OPERATIONS'
}

// Permission mappings for better maintainability
export const PERMISSIONS = {
  // Personnel management
  PERSONEL_READ: 'personel_read',
  PERSONEL_WRITE: 'personel_write',
  PERSONEL_DELETE: 'personel_delete',

  // Customer management
  MUSTERILER_READ: 'musteriler_read',
  MUSTERILER_WRITE: 'musteriler_write',
  MUSTERILER_DELETE: 'musteriler_delete',

  // Room management
  ODALAR_READ: 'odalar_read',
  ODALAR_WRITE: 'odalar_write',
  ODALAR_DELETE: 'odalar_delete',

  // Reservations
  RESERVASYONLAR_READ: 'rezervasyonlar_read',
  RESERVASYONLAR_WRITE: 'rezervasyonlar_write',
  RESERVASYONLAR_DELETE: 'rezervasyonlar_delete',

  // Payments
  ODEME_READ: 'odemeler_read',
  ODEME_WRITE: 'odemeler_write',
  ODEME_DELETE: 'odemeler_delete',

  // Services
  HIZMETLER_READ: 'ekstra_hizmetler_read',
  HIZMETLER_WRITE: 'ekstra_hizmetler_write',
  HIZMETLER_DELETE: 'ekstra_hizmetler_delete',
  HIZMETLER_STATUS_UPDATE: 'ekstra_hizmetler_status_update',

  // Stock management
  STOK_READ: 'depo_stok_read',
  STOK_WRITE: 'depo_stok_write',
  STOK_DELETE: 'depo_stok_delete',
  STOK_AMOUNT_UPDATE: 'depo_stok_amount_update',

  // Reports
  REPORTS_READ: 'reports_read',

  // Logs
  LOGS_READ: 'silinen_rezervasyon_log_read',

  // Dashboard
  DASHBOARD_READ: 'dashboard_read'
}

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.RECEPTION, ROLES.OPERATIONS],
  [ROLES.RECEPTION]: [ROLES.RECEPTION, ROLES.OPERATIONS],
  [ROLES.OPERATIONS]: [ROLES.OPERATIONS]
}

// Check if user role can access required role level
export const canAccessRole = (userRole, requiredRole) => {
  const hierarchy = ROLE_HIERARCHY[userRole] || []
  return hierarchy.includes(requiredRole)
}

// Get permissions for a role
export const getRolePermissions = (role) => {
  const permissionMap = {
    [ROLES.ADMIN]: [
      PERMISSIONS.PERSONEL_READ, PERMISSIONS.PERSONEL_WRITE, PERMISSIONS.PERSONEL_DELETE,
      PERMISSIONS.MUSTERILER_READ, PERMISSIONS.MUSTERILER_WRITE, PERMISSIONS.MUSTERILER_DELETE,
      PERMISSIONS.ODALAR_READ, PERMISSIONS.ODALAR_WRITE, PERMISSIONS.ODALAR_DELETE,
      PERMISSIONS.RESERVASYONLAR_READ, PERMISSIONS.RESERVASYONLAR_WRITE, PERMISSIONS.RESERVASYONLAR_DELETE,
      PERMISSIONS.ODEME_READ, PERMISSIONS.ODEME_WRITE, PERMISSIONS.ODEME_DELETE,
      PERMISSIONS.HIZMETLER_READ, PERMISSIONS.HIZMETLER_WRITE, PERMISSIONS.HIZMETLER_DELETE, PERMISSIONS.HIZMETLER_STATUS_UPDATE,
      PERMISSIONS.STOK_READ, PERMISSIONS.STOK_WRITE, PERMISSIONS.STOK_DELETE, PERMISSIONS.STOK_AMOUNT_UPDATE,
      PERMISSIONS.REPORTS_READ, PERMISSIONS.LOGS_READ, PERMISSIONS.DASHBOARD_READ
    ],
    [ROLES.RECEPTION]: [
      PERMISSIONS.MUSTERILER_READ, PERMISSIONS.MUSTERILER_WRITE,
      PERMISSIONS.ODALAR_READ,
      PERMISSIONS.RESERVASYONLAR_READ, PERMISSIONS.RESERVASYONLAR_WRITE,
      PERMISSIONS.HIZMETLER_READ, PERMISSIONS.HIZMETLER_STATUS_UPDATE,
      PERMISSIONS.DASHBOARD_READ
    ],
    [ROLES.OPERATIONS]: [
      PERMISSIONS.STOK_READ, PERMISSIONS.STOK_WRITE, PERMISSIONS.STOK_AMOUNT_UPDATE,
      PERMISSIONS.HIZMETLER_READ, PERMISSIONS.HIZMETLER_STATUS_UPDATE,
      PERMISSIONS.DASHBOARD_READ
    ]
  }

  return permissionMap[role] || []
}
