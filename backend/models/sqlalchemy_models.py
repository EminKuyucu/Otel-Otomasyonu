"""
SQLAlchemy ORM modelleri.

Bu modeller mevcut PyMySQL tabanlı sistemle paralel çalışır.
Veritabanı tablolarına birebir uyumludur.
"""

from .sqlalchemy_base import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, DECIMAL, Enum, Text, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Optional


class Personel(Base):
    """Personel tablosu SQLAlchemy modeli"""
    __tablename__ = 'personel'

    personel_id = Column(Integer, primary_key=True, autoincrement=True)
    kullanici_adi = Column(String(50), unique=True, nullable=False)
    sifre = Column(String(255), nullable=False)
    ad_soyad = Column(String(100), nullable=False)
    gorev = Column(String(50), default='Personel')
    aktiflik = Column(Boolean, default=True)
    olusturulma_tarihi = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<Personel(personel_id={self.personel_id}, kullanici_adi='{self.kullanici_adi}', ad_soyad='{self.ad_soyad}')>"


class Musteri(Base):
    """Musteriler tablosu SQLAlchemy modeli"""
    __tablename__ = 'musteriler'

    musteri_id = Column(Integer, primary_key=True, autoincrement=True)
    ad = Column(String(50), nullable=False)
    soyad = Column(String(50), nullable=False)
    tc_kimlik_no = Column(String(11), unique=True, nullable=False)
    telefon = Column(String(15), nullable=False)
    email = Column(String(100))
    cinsiyet = Column(Enum('Erkek', 'Kadın', 'Belirtilmemiş'))
    adres = Column(Text)
    ozel_notlar = Column(Text)
    kayit_tarihi = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<Musteri(musteri_id={self.musteri_id}, ad='{self.ad}', soyad='{self.soyad}')>"


class Oda(Base):
    """Odalar tablosu SQLAlchemy modeli"""
    __tablename__ = 'odalar'

    oda_id = Column(Integer, primary_key=True, autoincrement=True)
    oda_numarasi = Column(String(10), unique=True, nullable=False)
    oda_tipi = Column(Enum('Tek', 'Çift', 'Suit', 'VIP', 'Standart', 'Deluxe', 'Suite', 'VIP Suite', 'Engelli Odası', 'Single Economy', 'Aile', 'Connection Room', 'Corner Suit', 'Balayı Suiti', 'Penthouse', 'Kral Dairesi'), nullable=False)
    manzara = Column(String(50))
    metrekare = Column(Integer)
    ucret_gecelik = Column(DECIMAL(10, 2), nullable=False)
    durum = Column(Enum('Boş', 'Dolu', 'Temizlikte', 'Tadilat', 'Rezerve'))

    def __repr__(self):
        return f"<Oda(oda_id={self.oda_id}, oda_numarasi='{self.oda_numarasi}', durum='{self.durum}')>"


class OdaOzelligi(Base):
    """Oda ozellikleri tablosu SQLAlchemy modeli"""
    __tablename__ = 'oda_ozellikleri'

    ozellik_id = Column(Integer, primary_key=True, autoincrement=True)
    ozellik_adi = Column(String(50), nullable=False)

    def __repr__(self):
        return f"<OdaOzelligi(ozellik_id={self.ozellik_id}, ozellik_adi='{self.ozellik_adi}')>"


class OdaOzellikBaglanti(Base):
    """Oda ozellik baglanti tablosu SQLAlchemy modeli"""
    __tablename__ = 'oda_ozellik_baglanti'

    id = Column(Integer, primary_key=True, autoincrement=True)
    oda_id = Column(Integer, ForeignKey('odalar.oda_id'), nullable=False)
    ozellik_id = Column(Integer, ForeignKey('oda_ozellikleri.ozellik_id'), nullable=False)

    def __repr__(self):
        return f"<OdaOzellikBaglanti(id={self.id}, oda_id={self.oda_id}, ozellik_id={self.ozellik_id})>"


class EkstraHizmet(Base):
    """Ekstra hizmetler tablosu SQLAlchemy modeli"""
    __tablename__ = 'ekstra_hizmetler'

    hizmet_id = Column(Integer, primary_key=True, autoincrement=True)
    hizmet_adi = Column(String(100), nullable=False)
    birim_fiyat = Column(DECIMAL(10, 2), nullable=False)
    kategori = Column(String(50))

    def __repr__(self):
        return f"<EkstraHizmet(hizmet_id={self.hizmet_id}, hizmet_adi='{self.hizmet_adi}')>"


class Rezervasyon(Base):
    """Rezervasyonlar tablosu SQLAlchemy modeli"""
    __tablename__ = 'rezervasyonlar'

    rezervasyon_id = Column(Integer, primary_key=True, autoincrement=True)
    musteri_id = Column(Integer, ForeignKey('musteriler.musteri_id'), nullable=False)
    oda_id = Column(Integer, ForeignKey('odalar.oda_id'), nullable=False)
    giris_tarihi = Column(Date, nullable=False)
    cikis_tarihi = Column(Date, nullable=False)
    yetiskin_sayisi = Column(Integer)
    cocuk_sayisi = Column(Integer)
    toplam_ucret = Column(DECIMAL(10, 2), nullable=False)
    rezervasyon_tipi = Column(Enum('Ön Rezervasyon', 'Kapıdan', 'Acente', 'Online'))
    rezervasyon_durumu = Column(Enum('Bekliyor', 'Aktif', 'Tamamlandı', 'İptal'))
    olusturulma_tarihi = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<Rezervasyon(rezervasyon_id={self.rezervasyon_id}, musteri_id={self.musteri_id}, oda_id={self.oda_id})>"


class Odeme(Base):
    """Odemeler tablosu SQLAlchemy modeli"""
    __tablename__ = 'odemeler'

    odeme_id = Column(Integer, primary_key=True, autoincrement=True)
    rezervasyon_id = Column(Integer, ForeignKey('rezervasyonlar.rezervasyon_id'), nullable=False)
    odenen_tutar = Column(DECIMAL(10, 2), nullable=False)
    odeme_turu = Column(Enum('Nakit', 'Kredi Kartı', 'Havale', 'Sanal Pos'))
    odeme_tarihi = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<Odeme(odeme_id={self.odeme_id}, rezervasyon_id={self.rezervasyon_id}, odenen_tutar={self.odenen_tutar})>"


class MusteriHarcama(Base):
    """Musteri harcamaları tablosu SQLAlchemy modeli"""
    __tablename__ = 'musteri_harcamalari'

    harcama_id = Column(Integer, primary_key=True, autoincrement=True)
    rezervasyon_id = Column(Integer, ForeignKey('rezervasyonlar.rezervasyon_id'), nullable=False)
    hizmet_id = Column(Integer, ForeignKey('ekstra_hizmetler.hizmet_id'), nullable=False)
    adet = Column(Integer)
    toplam_fiyat = Column(DECIMAL(10, 2))
    islem_tarihi = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<MusteriHarcama(harcama_id={self.harcama_id}, rezervasyon_id={self.rezervasyon_id}, hizmet_id={self.hizmet_id})>"


class DepoStok(Base):
    """Depo stok tablosu SQLAlchemy modeli"""
    __tablename__ = 'depo_stok'

    urun_id = Column(Integer, primary_key=True, autoincrement=True)
    hizmet_id = Column(Integer, ForeignKey('ekstra_hizmetler.hizmet_id'))
    urun_adi = Column(String(100))
    stok_adedi = Column(Integer)
    son_guncelleme = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<DepoStok(urun_id={self.urun_id}, urun_adi='{self.urun_adi}', stok_adedi={self.stok_adedi})>"


class MusteriDegerlendirme(Base):
    """Musteri degerlendirme tablosu SQLAlchemy modeli"""
    __tablename__ = 'musteri_degerlendirme'

    degerlendirme_id = Column(Integer, primary_key=True, autoincrement=True)
    rezervasyon_id = Column(Integer, ForeignKey('rezervasyonlar.rezervasyon_id'), nullable=False)
    puan = Column(Integer)
    yorum = Column(Text)

    def __repr__(self):
        return f"<MusteriDegerlendirme(degerlendirme_id={self.degerlendirme_id}, rezervasyon_id={self.rezervasyon_id}, puan={self.puan})>"


class SilinenRezervasyonLog(Base):
    """Silinen rezervasyon log tablosu SQLAlchemy modeli"""
    __tablename__ = 'silinen_rezervasyon_log'

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    rezervasyon_id = Column(Integer)
    musteri_id = Column(Integer)
    silinme_tarihi = Column(TIMESTAMP)
    sebep = Column(String(255))

    def __repr__(self):
        return f"<SilinenRezervasyonLog(log_id={self.log_id}, rezervasyon_id={self.rezervasyon_id}, musteri_id={self.musteri_id})>"


class OdaResim(Base):
    """Oda resimleri tablosu SQLAlchemy modeli"""
    __tablename__ = 'oda_resimleri'

    resim_id = Column(Integer, primary_key=True, autoincrement=True)
    oda_id = Column(Integer, ForeignKey('odalar.oda_id'), nullable=False)
    resim_url = Column(String(500), nullable=False)
    resim_adi = Column(String(255))
    sira = Column(Integer, default=0)
    yuklenme_tarihi = Column(TIMESTAMP, server_default=func.current_timestamp())

    def __repr__(self):
        return f"<OdaResim(resim_id={self.resim_id}, oda_id={self.oda_id}, resim_adi='{self.resim_adi}')>"
