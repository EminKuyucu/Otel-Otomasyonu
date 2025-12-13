"""
Mevcut veritabanındaki şifreleri hashlemek için utility script.

NOT: Bu script sadece bir kez çalıştırılmalıdır.
Mevcut düz metin şifreleri bcrypt ile hashler.
"""

import sys
import os

# Proje kök dizinini path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import db
from models import Personel
from auth.password_utils import hash_password


def hash_all_passwords():
    """Tüm personel şifrelerini hashler"""
    with app.app_context():
        # Tüm personeli al
        personel_list = Personel.query.all()
        
        print(f"Toplam {len(personel_list)} personel bulundu.")
        
        updated_count = 0
        
        for personel in personel_list:
            # Şifre zaten hashlenmiş mi kontrol et (bcrypt hash'leri $2a$, $2b$ veya $2y$ ile başlar)
            if not personel.sifre.startswith('$2'):
                print(f"Şifre hashleniyor: {personel.kullanici_adi}")
                personel.sifre = hash_password(personel.sifre)
                updated_count += 1
            else:
                print(f"Şifre zaten hashlenmiş: {personel.kullanici_adi}")
        
        if updated_count > 0:
            db.session.commit()
            print(f"\n{updated_count} personelin şifresi başarıyla hashlenmiştir.")
        else:
            print("\nHashlenecek şifre bulunamadı.")


if __name__ == '__main__':
    print("=" * 50)
    print("Personel Şifre Hashleme Script'i")
    print("=" * 50)
    
    try:
        hash_all_passwords()
        print("\nİşlem tamamlandı!")
    except Exception as e:
        print(f"\nHATA: {str(e)}")
        db.session.rollback()




