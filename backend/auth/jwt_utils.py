import jwt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app

# JWT Secret Key (production'da environment variable'dan alınmalı)
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24


def generate_token(personel_id, kullanici_adi, gorev):
    """
    JWT token üretir.
    
    Args:
        personel_id: Personel ID'si
        kullanici_adi: Kullanıcı adı
        gorev: Personel görevi
        
    Returns:
        str: JWT token
    """
    payload = {
        'personel_id': personel_id,
        'kullanici_adi': kullanici_adi,
        'gorev': gorev,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token


def verify_token(token):
    """
    JWT token'ı doğrular ve payload'ı döndürür.
    
    Args:
        token: JWT token string
        
    Returns:
        dict: Token payload veya None (geçersizse)
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_token_from_request():
    """
    Request header'ından token'ı alır.
    
    Returns:
        str: Token veya None
    """
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    # "Bearer <token>" formatından token'ı çıkar
    try:
        token = auth_header.split(' ')[1]
        return token
    except IndexError:
        return None


def token_required(f):
    """
    Decorator: Route'ları JWT token ile korur.
    
    Kullanım:
        @bp.route('/protected')
        @token_required
        def protected_route(current_user):
            return jsonify(current_user)
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if not token:
            return jsonify({
                'error': 'Token bulunamadı',
                'message': 'Authorization header\'ında Bearer token gerekli'
            }), 401
        
        payload = verify_token(token)
        
        if not payload:
            return jsonify({
                'error': 'Geçersiz veya süresi dolmuş token',
                'message': 'Lütfen tekrar giriş yapın'
            }), 401
        
        # current_user'ı kwargs'a ekle
        kwargs['current_user'] = payload
        
        return f(*args, **kwargs)
    
    return decorated







