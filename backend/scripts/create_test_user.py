"""
Test kullanıcısı oluşturma scripti
Veritabanında personel kaydı yoksa bu script ile test kullanıcıları oluşturulur.
"""

from app import app
from database import execute_query
from auth.password_utils import hash_password


def create_test_user():
    try:
        with app.app_context():
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
                check_query = "SELECT personel_id FROM personel WHERE kullanici_adi = %s"
                existing = execute_query(check_query, (user["kullanici_adi"],), fetch=True)

                hashed_password = hash_password(user["sifre"])

                if existing:
                    update_query = """
                        UPDATE personel
                        SET sifre=%s, ad_soyad=%s, gorev=%s, aktiflik=%s
                        WHERE kullanici_adi=%s
                    """
                    execute_query(
                        update_query,
                        (
                            hashed_password,
                            user["ad_soyad"],
                            user["gorev"],
                            True,
                            user["kullanici_adi"]
                        ),
                        fetch=False
                    )
                    print(f"🔁 Güncellendi: {user['kullanici_adi']}")
                    updated_count += 1
                else:
                    insert_query = """
                        INSERT INTO personel
                        (kullanici_adi, sifre, ad_soyad, gorev, aktiflik, olusturulma_tarihi)
                        VALUES (%s, %s, %s, %s, %s, NOW())
                    """
                    execute_query(
                        insert_query,
                        (
                            user["kullanici_adi"],
                            hashed_password,
                            user["ad_soyad"],
                            user["gorev"],
                            True
                        ),
                        fetch=False
                    )
                    print(f"➕ Oluşturuldu: {user['kullanici_adi']}")
                    created_count += 1

            print("\n" + "=" * 50)
            print(f"✔ {created_count} yeni kullanıcı")
            print(f"✔ {updated_count} güncellenen kullanıcı")
            print("=" * 50)

    except Exception as e:
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("=" * 50)
    print("TEST KULLANICISI OLUŞTURMA")
    print("=" * 50)
    create_test_user()
