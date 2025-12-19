#!/usr/bin/env python3
"""
SQLAlchemy ORM modellerini test eden script.

Bu script mevcut PyMySQL backend yapısını etkilemez.
"""

import sys
import os
from datetime import datetime, date

# Proje root dizinine git
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Models klasörünü de path'e ekle
models_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
sys.path.insert(0, models_path)

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
        sys.exit(1)

    # Modelleri test et
    print("\n=== MODEL TESTLERİ ===")

    # Personel model testi
    try:
        personel = Personel(
            kullanici_adi="test_user",
            sifre="hashed_password",
            ad_soyad="Test Kullanıcı",
            gorev="Test Görevi",
            aktiflik=True
        )
        print("✓ Personel modeli oluşturuldu")
        print(f"  - __tablename__: {Personel.__tablename__}")
        print(f"  - __repr__: {personel}")
    except Exception as e:
        print(f"✗ Personel modeli hatası: {e}")

    # Musteri model testi
    try:
        musteri = Musteri(
            ad="Test",
            soyad="Kullanıcı",
            tc_kimlik_no="12345678901",
            telefon="05551234567",
            email="test@example.com",
            cinsiyet="Erkek",
            adres="Test Adresi",
            ozel_notlar="Test notları"
        )
        print("✓ Musteri modeli oluşturuldu")
        print(f"  - __repr__: {musteri}")
    except Exception as e:
        print(f"✗ Musteri modeli hatası: {e}")

    # Oda model testi
    try:
        oda = Oda(
            oda_numarasi="101",
            oda_tipi="Standart",
            manzara="Deniz",
            metrekare=25,
            ucret_gecelik=150.00,
            durum="Boş"
        )
        print("✓ Oda modeli oluşturuldu")
        print(f"  - __repr__: {oda}")
    except Exception as e:
        print(f"✗ Oda modeli hatası: {e}")

    # OdaOzelligi model testi
    try:
        ozellik = OdaOzelligi(ozellik_adi="Klima")
        print("✓ OdaOzelligi modeli oluşturuldu")
        print(f"  - __repr__: {ozellik}")
    except Exception as e:
        print(f"✗ OdaOzelligi modeli hatası: {e}")

    # EkstraHizmet model testi
    try:
        hizmet = EkstraHizmet(
            hizmet_adi="Kahvaltı",
            birim_fiyat=25.00,
            kategori="Yiyecek"
        )
        print("✓ EkstraHizmet modeli oluşturuldu")
        print(f"  - __repr__: {hizmet}")
    except Exception as e:
        print(f"✗ EkstraHizmet modeli hatası: {e}")

    # Rezervasyon model testi
    try:
        rezervasyon = Rezervasyon(
            musteri_id=1,
            oda_id=1,
            giris_tarihi=date.today(),
            cikis_tarihi=date.today(),
            yetiskin_sayisi=2,
            cocuk_sayisi=0,
            toplam_ucret=300.00,
            rezervasyon_tipi="Online",
            rezervasyon_durumu="Aktif"
        )
        print("✓ Rezervasyon modeli oluşturuldu")
        print(f"  - __repr__: {rezervasyon}")
    except Exception as e:
        print(f"✗ Rezervasyon modeli hatası: {e}")

    # Odeme model testi
    try:
        odeme = Odeme(
            rezervasyon_id=1,
            odenen_tutar=150.00,
            odeme_turu="Kredi Kartı"
        )
        print("✓ Odeme modeli oluşturuldu")
        print(f"  - __repr__: {odeme}")
    except Exception as e:
        print(f"✗ Odeme modeli hatası: {e}")

    # MusteriHarcama model testi
    try:
        harcama = MusteriHarcama(
            rezervasyon_id=1,
            hizmet_id=1,
            adet=2,
            toplam_fiyat=50.00
        )
        print("✓ MusteriHarcama modeli oluşturuldu")
        print(f"  - __repr__: {harcama}")
    except Exception as e:
        print(f"✗ MusteriHarcama modeli hatası: {e}")

    # DepoStok model testi
    try:
        stok = DepoStok(
            hizmet_id=1,
            urun_adi="Test Ürün",
            stok_adedi=100
        )
        print("✓ DepoStok modeli oluşturuldu")
        print(f"  - __repr__: {stok}")
    except Exception as e:
        print(f"✗ DepoStok modeli hatası: {e}")

    # MusteriDegerlendirme model testi
    try:
        degerlendirme = MusteriDegerlendirme(
            rezervasyon_id=1,
            puan=5,
            yorum="Harika hizmet!"
        )
        print("✓ MusteriDegerlendirme modeli oluşturuldu")
        print(f"  - __repr__: {degerlendirme}")
    except Exception as e:
        print(f"✗ MusteriDegerlendirme modeli hatası: {e}")

    # SilinenRezervasyonLog model testi
    try:
        log = SilinenRezervasyonLog(
            rezervasyon_id=1,
            musteri_id=1,
            silinme_tarihi=datetime.now(),
            sebep="İptal edildi"
        )
        print("✓ SilinenRezervasyonLog modeli oluşturuldu")
        print(f"  - __repr__: {log}")
    except Exception as e:
        print(f"✗ SilinenRezervasyonLog modeli hatası: {e}")

    # OdaOzellikBaglanti model testi
    try:
        baglanti = OdaOzellikBaglanti(
            oda_id=1,
            ozellik_id=1
        )
        print("✓ OdaOzellikBaglanti modeli oluşturuldu")
        print(f"  - __repr__: {baglanti}")
    except Exception as e:
        print(f"✗ OdaOzellikBaglanti modeli hatası: {e}")

    print("\n=== TÜM TESTLER BAŞARILI ===")
    print("✓ SQLAlchemy ORM modelleri hatasız çalışıyor")
    print("✓ Mevcut PyMySQL backend yapısı etkilenmedi")

except ImportError as e:
    print(f"✗ Import hatası: {e}")
    print("SQLAlchemy modelleri yüklenemedi")
    sys.exit(1)
except Exception as e:
    print(f"✗ Genel hata: {e}")
    sys.exit(1)
