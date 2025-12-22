# RBAC decorators for Flask routes

from functools import wraps
from flask import jsonify
from .permissions import has_permission

def permission_required(permission):
    """
    Decorator to require specific permission for route access.

    Args:
        permission (str): Required permission

    Returns:
        function: Decorated function
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get current_user from kwargs (set by token_required)
            current_user = kwargs.get('current_user')

            if not current_user:
                return jsonify({
                    'error': 'Kimlik doğrulama hatası',
                    'message': 'Kullanıcı bilgileri bulunamadı'
                }), 401

            user_role = current_user.get('role')
            if not user_role:
                return jsonify({
                    'error': 'Yetki hatası',
                    'message': 'Kullanıcı rolü tanımlanmamış'
                }), 403

            if not has_permission(user_role, permission):
                return jsonify({
                    'error': 'Yetkisiz erişim',
                    'message': f'Bu işlem için {permission} yetkisi gerekli'
                }), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def resource_access_required(resource, action):
    """
    Decorator to require resource access permission.

    Args:
        resource (str): Resource name (table/view)
        action (str): Action (read/write/delete)

    Returns:
        function: Decorated function
    """
    permission = f"{resource}_{action}"
    return permission_required(permission)

# Convenience decorators for common operations
def read_required(resource):
    """Require read permission for resource"""
    return resource_access_required(resource, 'read')

def write_required(resource):
    """Require write permission for resource"""
    return resource_access_required(resource, 'write')

def delete_required(resource):
    """Require delete permission for resource"""
    return resource_access_required(resource, 'delete')
