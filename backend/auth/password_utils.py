import bcrypt


def hash_password(password):
    """
    Şifreyi bcrypt ile hashler.
    
    Args:
        password: Düz metin şifre
        
    Returns:
        str: Hashlenmiş şifre (bytes'ı decode edilmiş)
    """
    # Şifreyi bytes'a çevir
    password_bytes = password.encode('utf-8')
    
    # Bcrypt ile hashle (salt otomatik eklenir)
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    
    # String'e çevir ve döndür
    return hashed.decode('utf-8')


def verify_password(password, hashed_password):
    """
    Şifreyi hashlenmiş şifre ile karşılaştırır.
    
    Args:
        password: Düz metin şifre
        hashed_password: Hashlenmiş şifre (string)
        
    Returns:
        bool: Şifre eşleşiyorsa True, değilse False
    """
    try:
        # String'leri bytes'a çevir
        password_bytes = password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        
        # Bcrypt ile doğrula
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception as e:
        # Hata durumunda False döndür
        return False








