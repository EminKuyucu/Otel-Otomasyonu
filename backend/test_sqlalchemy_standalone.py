#!/usr/bin/env python3
"""
SQLAlchemy ORM modellerini bağımsız olarak test eden script.

Bu script mevcut PyMySQL sistemini etkilemez ve SQLAlchemy modellerini ayrı test eder.
"""

import sys
import os
from datetime import datetime, date

# Proje root dizinine git
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Models klasörünü de path'e ekle
models_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
sys.path.insert(0, models_path)

def test_sqlalchemy_import():
    """SQLAlchemy import'unu test eder"""
    try:
        import sqlalchemy
        version = sqlalchemy.__version__
        print(f"✓ SQLAlchemy {version} başarıyla import edildi")

        # Python 3.13 uyumluluk kontrolü
        if hasattr(sys, 'version_info') and sys.version_info >= (3, 13):
            if tuple(map(int, version.split('.'))) < (2, 0, 25):
                print(f"⚠ Uyarı: SQLAlchemy {version} Python 3.13 ile tam uyumlu olmayabilir")
                print("   Önerilen: SQLAlchemy >= 2.0.25")
            else:
                print("✓ SQLAlchemy sürümü Python 3.13 ile uyumlu")

        return True
    except ImportError as e:
        print(f"✗ SQLAlchemy import edilemedi: {e}")
        print("   Kurulumu için: pip install SQLAlchemy==2.0.32")
        return False
    except Exception as e:
        print(f"✗ SQLAlchemy hatası: {e}")
        return False

def test_models():
    """SQLAlchemy modellerini test eder"""
    try:
        from sqlalchemy import text
        from models.sqlalchemy_base import Base, engine, db_session
        from models.sqlalchemy_models import (
            Personel, Musteri, Oda, OdaOzelligi, OdaOzellikBaglanti,
            EkstraHizmet, Rezervasyon, Odeme, MusteriHarcama,
            DepoStok, MusteriDegerlendirme, SilinenRezervasyonLog
        )
        print("✓ SQLAlchemy modelleri başarıyla import edildi")

        # Veritabanı bağlantısını test et
        try:
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1 as test"))
                print("✓ Veritabanı bağlantısı başarılı")
        except Exception as e:
            print(f"✗ Veritabanı bağlantı hatası: {e}")
            print("   Bu normal olabilir - sadece model yapısı test ediliyor")
            return False

        print("\n=== MODEL YAPISI TESTLERİ ===")

        # Personel model testi
        try:
            personel = Personel(
                kullanici_adi="test_user",
                sifre="hashed_password",
                ad_soyad="Test User",
                gorev="Test",
                aktiflik=True
            )
            print("✓ Personel modeli oluşturuldu")
            print(f"   Tablo: {Personel.__tablename__}")
            print(f"   Repr: {personel}")
        except Exception as e:
            print(f"✗ Personel modeli hatası: {e}")
            return False

        # Diğer modellerin temel testleri
        models_to_test = [
            ("Musteri", Musteri, {"ad": "Test", "soyad": "User", "tc_kimlik_no": "12345678901", "telefon": "05551234567"}),
            ("Oda", Oda, {"oda_numarasi": "101", "oda_tipi": "Standart", "ucret_gecelik": 150.00, "durum": "Boş"}),
            ("EkstraHizmet", EkstraHizmet, {"hizmet_adi": "Kahvaltı", "birim_fiyat": 25.00}),
            ("Rezervasyon", Rezervasyon, {
                "musteri_id": 1, "oda_id": 1,
                "giris_tarihi": date.today(), "cikis_tarihi": date.today(),
                "toplam_ucret": 300.00, "rezervasyon_durumu": "Aktif"
            })
        ]

        for model_name, model_class, test_data in models_to_test:
            try:
                instance = model_class(**test_data)
                print(f"✓ {model_name} modeli oluşturuldu")
            except Exception as e:
                print(f"✗ {model_name} modeli hatası: {e}")
                return False

        print("\n✓ Tüm modeller başarıyla test edildi!")
        return True

    except Exception as e:
        print(f"✗ Model testi hatası: {e}")
        return False

def main():
    """Ana test fonksiyonu"""
    print("=== SQLAlchemy ORM Model Testi ===")
    print(f"Python sürümü: {sys.version}")
    print()

    # SQLAlchemy import test
    if not test_sqlalchemy_import():
        print("\n❌ SQLAlchemy kurulumu gerekli!")
        return 1

    print()

    # Model testleri
    if not test_models():
        print("\n❌ Model testleri başarısız!")
        return 1

    print("\n🎉 Tüm testler başarılı! SQLAlchemy ORM modelleri hazır.")
    print("\n📖 Kullanım için: models/README_SQLAlchemy.md")
    return 0

if __name__ == "__main__":
    sys.exit(main())
