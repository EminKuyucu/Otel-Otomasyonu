"""
Hızlı bağlantı test scripti
Backend ve veritabanı bağlantısını test eder
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000"

def test_api_connection():
    """API'nin çalışıp çalışmadığını test eder"""
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code == 200:
            print("✅ API çalışıyor!")
            print(f"   Yanıt: {response.json()}")
            return True
        else:
            print(f"❌ API yanıt vermedi. Status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ API'ye bağlanılamadı. Backend çalışmıyor olabilir.")
        print("   Backend'i başlatmak için: cd backend && python app.py")
        return False
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        return False

def test_db_connection():
    """Veritabanı bağlantısını test eder"""
    try:
        response = requests.get(f"{BASE_URL}/api/test-db", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'connected':
                print("✅ Veritabanı bağlantısı başarılı!")
                return True
            else:
                print(f"⚠️  Veritabanı bağlantı sorunu: {data.get('message')}")
                return False
        else:
            print(f"❌ Veritabanı testi başarısız. Status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Veritabanı test hatası: {str(e)}")
        return False

def test_login():
    """Login endpoint'ini test eder"""
    try:
        login_data = {
            "email": "talha",
            "password": "12345"
        }
        response = requests.post(
            f"{BASE_URL}/api/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login başarılı!")
            print(f"   Kullanıcı: {data.get('user', {}).get('ad_soyad')}")
            print(f"   Token: {data.get('token', '')[:50]}...")
            return True, data.get('token')
        elif response.status_code == 401:
            print("⚠️  Login başarısız (401)")
            print("   Not: Şifreler hashlenmemiş olabilir.")
            print("   Script çalıştırın: python scripts/hash_existing_passwords.py")
            return False, None
        else:
            print(f"❌ Login hatası. Status: {response.status_code}")
            print(f"   Yanıt: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Login test hatası: {str(e)}")
        return False, None

def test_protected_route(token):
    """Korumalı bir route'u test eder"""
    if not token:
        print("⚠️  Token yok, korumalı route test edilemiyor")
        return False
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        response = requests.get(f"{BASE_URL}/api/personel", headers=headers, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Korumalı route çalışıyor! ({len(data)} personel bulundu)")
            return True
        else:
            print(f"❌ Korumalı route hatası. Status: {response.status_code}")
            print(f"   Yanıt: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Korumalı route test hatası: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("OTEL OTOMASYONU - BAĞLANTI TESTİ")
    print("=" * 60)
    print()
    
    # 1. API bağlantısı
    print("1. API Bağlantı Testi...")
    api_ok = test_api_connection()
    print()
    
    if not api_ok:
        print("\n❌ API çalışmıyor. Lütfen backend'i başlatın:")
        print("   cd backend")
        print("   python app.py")
        sys.exit(1)
    
    # 2. Veritabanı bağlantısı
    print("2. Veritabanı Bağlantı Testi...")
    db_ok = test_db_connection()
    print()
    
    # 3. Login testi
    print("3. Login Testi...")
    login_ok, token = test_login()
    print()
    
    # 4. Korumalı route testi
    if login_ok and token:
        print("4. Korumalı Route Testi...")
        test_protected_route(token)
        print()
    
    print("=" * 60)
    print("TEST TAMAMLANDI")
    print("=" * 60)





