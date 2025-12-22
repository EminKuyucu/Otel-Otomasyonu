# Permission definitions and access control for RBAC system

from .roles import ADMIN, RECEPTION, OPERATIONS

# Permission constants
PERMISSIONS = {
    # Personnel management - Only ADMIN
    'personel_read': [ADMIN],
    'personel_write': [ADMIN],
    'personel_delete': [ADMIN],

    # Customer management - ADMIN and RECEPTION
    'musteriler_read': [ADMIN, RECEPTION],
    'musteriler_write': [ADMIN, RECEPTION],
    'musteriler_delete': [ADMIN],

    # Room management - ADMIN and RECEPTION (read), ADMIN only (write/delete)
    'odalar_read': [ADMIN, RECEPTION],
    'odalar_write': [ADMIN],
    'odalar_delete': [ADMIN],

    # Room features - ADMIN and RECEPTION (read), ADMIN only (write)
    'oda_ozellikleri_read': [ADMIN, RECEPTION],
    'oda_ozellikleri_write': [ADMIN],

    # Reservations - ADMIN and RECEPTION
    'rezervasyonlar_read': [ADMIN, RECEPTION],
    'rezervasyonlar_write': [ADMIN, RECEPTION],
    'rezervasyonlar_delete': [ADMIN],

    # Payments - Only ADMIN
    'odemeler_read': [ADMIN],
    'odemeler_write': [ADMIN],
    'odemeler_delete': [ADMIN],

    # Extra services - ADMIN and RECEPTION (read), ADMIN only (write)
    'ekstra_hizmetler_read': [ADMIN, RECEPTION],
    'ekstra_hizmetler_write': [ADMIN],

    # Customer spending - Only ADMIN
    'musteri_harcamalari_read': [ADMIN],
    'musteri_harcamalari_write': [ADMIN],

    # Stock management - ADMIN and OPERATIONS
    'depo_stok_read': [ADMIN, OPERATIONS],
    'depo_stok_write': [ADMIN, OPERATIONS],
    'depo_stok_delete': [ADMIN],  # Only ADMIN can delete stock items
    'depo_stok_amount_update': [ADMIN, OPERATIONS],  # Stock amount changes (increase/decrease)
    'depo_stok_write': [ADMIN, OPERATIONS],

    # Customer reviews - ADMIN and RECEPTION
    'musteri_degerlendirme_read': [ADMIN, RECEPTION],
    'musteri_degerlendirme_write': [ADMIN, RECEPTION],

    # Services management - ADMIN full access, OPERATIONS status only, RECEPTION read only
    'ekstra_hizmetler_read': [ADMIN, RECEPTION],
    'ekstra_hizmetler_write': [ADMIN],
    'ekstra_hizmetler_delete': [ADMIN],
    'ekstra_hizmetler_status_update': [ADMIN, OPERATIONS],  # Only status changes (active/inactive)

    # Reports and analytics - Only ADMIN
    'reports_read': [ADMIN],

    # System logs - Only ADMIN
    'silinen_rezervasyon_log_read': [ADMIN],

    # Dashboard - All roles
    'dashboard_read': [ADMIN, RECEPTION, OPERATIONS],
}

def has_permission(user_role, permission):
    """
    Check if user role has specific permission.

    Args:
        user_role (str): User's normalized role
        permission (str): Permission to check

    Returns:
        bool: True if user has permission
    """
    allowed_roles = PERMISSIONS.get(permission, [])
    return user_role in allowed_roles

def get_user_permissions(user_role):
    """
    Get all permissions for a user role.

    Args:
        user_role (str): User's normalized role

    Returns:
        list: List of permissions user has
    """
    return [perm for perm, roles in PERMISSIONS.items() if user_role in roles]

def check_resource_access(user_role, resource, action):
    """
    Check if user can perform action on resource.

    Args:
        user_role (str): User's normalized role
        resource (str): Resource name (table/view)
        action (str): Action (read/write/delete)

    Returns:
        bool: True if access allowed
    """
    permission = f"{resource}_{action}"
    return has_permission(user_role, permission)
