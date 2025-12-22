# Role definitions and mappings for RBAC system

# Normalized role constants
ADMIN = 'ADMIN'
RECEPTION = 'RECEPTION'
OPERATIONS = 'OPERATIONS'

# Role mapping from database gorev values
ROLE_MAPPING = {
    'Genel Müdür': ADMIN,
    'Yönetici': ADMIN,
    'Resepsiyon Şefi': RECEPTION,
    'Resepsiyonist': RECEPTION,
    'Mutfak Şefi': OPERATIONS,
    'Operasyon Şefi': OPERATIONS,
    'Stok Sorumlusu': OPERATIONS,
    # All other gorev values default to OPERATIONS for safety
}

def normalize_role(gorev):
    """
    Convert database gorev value to normalized role.

    Args:
        gorev (str): Database gorev field value

    Returns:
        str: Normalized role constant
    """
    return ROLE_MAPPING.get(gorev, OPERATIONS)

def get_role_hierarchy():
    """
    Get role hierarchy for permission checking.

    Returns:
        dict: Role hierarchy mapping
    """
    return {
        ADMIN: [ADMIN, RECEPTION, OPERATIONS],
        RECEPTION: [RECEPTION, OPERATIONS],
        OPERATIONS: [OPERATIONS]
    }

def can_access_role(user_role, required_role):
    """
    Check if user role can access required role level.

    Args:
        user_role (str): User's normalized role
        required_role (str): Required role for access

    Returns:
        bool: True if access allowed
    """
    hierarchy = get_role_hierarchy()
    return required_role in hierarchy.get(user_role, [])
