"""
Mevcut veritabanındaki şifreleri hashlemek için utility script.

NOT: Bu script sadece bir kez çalıştırılmalıdır.
Mevcut düz metin şifreleri bcrypt ile hashler.
"""

import sys
import os

# Proje kök dizinini path'e ekle
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import execute_query, init_database
from auth.password_utils import hash_password


def hash_all_passwords():
    """Tüm personel şifrelerini hashler"""
    # Veritabanı bağlantısını başlat
    init_database()
    # Tüm personeli al
    query = "SELECT personel_id, kullanici_adi, sifre FROM personel"
    personel_list = execute_query(query, fetch=True)

    if not personel_list:
        print("Personel bulunamadı.")
        return

    print(f"Toplam {len(personel_list)} personel bulundu.")

    updated_count = 0

    for personel in personel_list:
        # Şifre zaten hashlenmiş mi kontrol et (bcrypt hash'leri $2a$, $2b$ veya $2y$ ile başlar)
        if not personel['sifre'].startswith('$2'):
            print(f"Şifre hashleniyor: {personel['kullanici_adi']}")
            hashed_password = hash_password(personel['sifre'])

            # Şifreyi güncelle
            update_query = "UPDATE personel SET sifre = %s WHERE personel_id = %s"
            execute_query(update_query, (hashed_password, personel['personel_id']), fetch=False)
            updated_count += 1
        else:
            print(f"Şifre zaten hashlenmiş: {personel['kullanici_adi']}")

    if updated_count > 0:
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














