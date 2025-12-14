"""
Test kullanıcısı oluşturma scripti
Veritabanında personel kaydı yoksa bu script ile test kullanıcısı oluşturabilirsiniz.
"""
import sys
import os

# Backend dizinini path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import init_database, execute_query
from auth.password_utils import hash_password

def create_test_user():
    """Test kullanıcılarını oluşturur"""
    try:
        # Flask app context ile çalıştır
        with app.app_context():
            # Veritabanı bağlantısını başlat
            init_database(app)
        
            # Test kullanıcıları bilgileri
            users = [
                {
                    "kullanici_adi": "talha",
                    "sifre": "12345",
                    "ad_soyad": "Talha",
                    "gorev": "Personel"
                },
                {
                    "kullanici_adi": "emin",
                    "sifre": "12345",
                    "ad_soyad": "Emin",
                    "gorev": "Personel"
                }
            ]
            
            created_count = 0
            updated_count = 0
            
            for user in users:
                kullanici_adi = user["kullanici_adi"]
                sifre = user["sifre"]
                ad_soyad = user["ad_soyad"]
                gorev = user["gorev"]
                
                # Kullanıcı zaten var mı kontrol et
                check_query = "SELECT personel_id FROM personel WHERE kullanici_adi = %s"
                existing = execute_query(check_query, params=(kullanici_adi,), fetch=True)
                
                if existing and len(existing) > 0:
                    print(f"⚠️  Kullanıcı '{kullanici_adi}' zaten mevcut - şifre güncelleniyor...")
                    
                    # Şifreyi güncelle
                    hashed_password = hash_password(sifre)
                    update_query = "UPDATE personel SET sifre = %s, ad_soyad = %s, gorev = %s, aktiflik = %s WHERE kullanici_adi = %s"
                    execute_query(update_query, params=(hashed_password, ad_soyad, gorev, True, kullanici_adi), fetch=False)
                    print(f"✅ Şifre güncellendi: {kullanici_adi} / {sifre}")
                    updated_count += 1
                else:
                    # Şifreyi hashle
                    hashed_password = hash_password(sifre)
                    
                    # Yeni kullanıcı oluştur
                    insert_query = """
                    INSERT INTO personel (kullanici_adi, sifre, ad_soyad, gorev, aktiflik, olusturulma_tarihi)
                    VALUES (%s, %s, %s, %s, %s, NOW())
                    """
                    execute_query(insert_query, params=(
                        kullanici_adi,
                        hashed_password,
                        ad_soyad,
                        gorev,
                        True
                    ), fetch=False)
                    
                    print(f"✅ Kullanıcı oluşturuldu: {kullanici_adi} / {sifre}")
                    created_count += 1
            
            print("\n" + "=" * 60)
            print(f"✅ Toplam {created_count} yeni kullanıcı oluşturuldu")
            print(f"✅ Toplam {updated_count} kullanıcı güncellendi")
            print("=" * 60)
            print("\n📝 Frontend'de login yaparken:")
            print("   Kullanıcı 1:")
            print("     Kullanıcı Adı: talha")
            print("     Şifre: 12345")
            print("   Kullanıcı 2:")
            print("     Kullanıcı Adı: emin")
            print("     Şifre: 12345")
        
    except Exception as e:
        print(f"❌ Hata: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\nKontrol edin:")
        print("1. Veritabanı bağlantısı çalışıyor mu?")
        print("2. .env dosyasında DATABASE_URI doğru mu?")
        print("3. 'personel' tablosu var mı?")

if __name__ == "__main__":
    print("=" * 60)
    print("TEST KULLANICISI OLUŞTURMA")
    print("=" * 60)
    print()
    create_test_user()
    print()
    print("=" * 60)

