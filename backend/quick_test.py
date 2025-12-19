"""
Hızlı sistem kontrolü - requests gerektirmez
Sadece backend'in çalışıp çalışmadığını kontrol eder
"""

import sys
import os

# Proje kök dizinini path'e ekle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_imports():
    """Gerekli modüllerin yüklü olup olmadığını kontrol eder"""
    print("📦 Bağımlılık kontrolü...")
    
    missing = []
    
    try:
        import flask
        print("  ✅ Flask")
    except ImportError:
        print("  ❌ Flask")
        missing.append("Flask")
    
    try:
        import flask_sqlalchemy
        print("  ✅ Flask-SQLAlchemy")
    except ImportError:
        print("  ❌ Flask-SQLAlchemy")
        missing.append("Flask-SQLAlchemy")
    
    try:
        import flask_cors
        print("  ✅ Flask-CORS")
    except ImportError:
        print("  ❌ Flask-CORS")
        missing.append("Flask-CORS")
    
    try:
        import pymysql
        print("  ✅ PyMySQL")
    except ImportError:
        print("  ❌ PyMySQL")
        missing.append("PyMySQL")
    
    try:
        import bcrypt
        print("  ✅ bcrypt")
    except ImportError:
        print("  ❌ bcrypt")
        missing.append("bcrypt")
    
    try:
        import jwt
        print("  ✅ PyJWT")
    except ImportError:
        print("  ❌ PyJWT")
        missing.append("PyJWT")
    
    try:
        import dotenv
        print("  ✅ python-dotenv")
    except ImportError:
        print("  ❌ python-dotenv")
        missing.append("python-dotenv")
    
    if missing:
        print(f"\n⚠️  Eksik paketler: {', '.join(missing)}")
        print("   Yüklemek için: pip install -r requirements.txt")
        return False
    else:
        print("\n✅ Tüm bağımlılıklar yüklü!")
        return True

def check_files():
    """Gerekli dosyaların var olup olmadığını kontrol eder"""
    print("\n📁 Dosya kontrolü...")
    
    files = [
        "app.py",
        "database.py",
        "routes/auth_routes.py",
        "models/personel.py",
        "auth/jwt_utils.py",
        "auth/password_utils.py"
    ]
    
    all_exist = True
    for file in files:
        if os.path.exists(file):
            print(f"  ✅ {file}")
        else:
            print(f"  ❌ {file}")
            all_exist = False
    
    return all_exist

def check_env():
    """.env dosyasını kontrol eder"""
    print("\n⚙️  Konfigürasyon kontrolü...")
    
    if os.path.exists(".env"):
        print("  ✅ .env dosyası bulundu")
        return True
    else:
        print("  ⚠️  .env dosyası bulunamadı")
        print("     Oluşturmanız gerekiyor:")
        print("     DATABASE_URI=mysql+pymysql://root:password@localhost/otel_otomasyonu_pro")
        print("     JWT_SECRET_KEY=your-secret-key-here")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("OTEL OTOMASYONU - HIZLI KONTROL")
    print("=" * 60)
    print()
    
    imports_ok = check_imports()
    files_ok = check_files()
    env_ok = check_env()
    
    print("\n" + "=" * 60)
    print("SONUÇ")
    print("=" * 60)
    
    if imports_ok and files_ok:
        print("\n✅ Sistem hazır!")
        print("\n🚀 Backend'i başlatmak için:")
        print("   python app.py")
        print("\n📝 Not: Veritabanı bağlantısı için .env dosyasını oluşturun.")
    else:
        print("\n⚠️  Bazı kontroller başarısız.")
        if not imports_ok:
            print("   → Bağımlılıkları yükleyin: pip install -r requirements.txt")
        if not files_ok:
            print("   → Eksik dosyalar var, projeyi kontrol edin.")
    
    print()











