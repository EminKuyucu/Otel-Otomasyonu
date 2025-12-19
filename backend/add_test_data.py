#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test verilerini veritabanına eklemek için script
"""

import sys
import os
sys.path.append('.')

from database import execute_query

def add_test_rooms():
    """Test odaları ekler"""
    try:
        print("=== TEST ODALARI EKLEME ===")

        # Mevcut oda sayısını kontrol et
        result = execute_query('SELECT COUNT(*) as total FROM odalar')
        current_count = result[0]['total']
        print(f"Mevcut oda sayısı: {current_count}")

        if current_count > 0:
            print("Zaten odalar var, yeni oda eklenmeyecek.")
            return

        # Test odaları ekle
        test_rooms = [
            (101, 'Tek', 'Deniz', 150.00, 'Boş'),
            (102, 'Çift', 'Panoramik Deniz', 250.00, 'Dolu'),
            (103, 'Suit', 'Bahçe', 400.00, 'Rezerve'),
            (104, 'VIP', 'Havuz', 600.00, 'Boş'),
            (105, 'Tek', 'Şehir', 120.00, 'Temizlikte'),
            (106, 'Çift', 'Orman', 180.00, 'Boş'),
            (201, 'Tek', 'Yok', 100.00, 'Tadilat'),
            (202, 'Suit', 'Deniz', 450.00, 'Boş'),
            (203, 'Çift', 'Bahçe', 220.00, 'Dolu'),
            (204, 'VIP', 'Panoramik Deniz', 750.00, 'Rezerve')
        ]

        for room_no, tip, manzara, fiyat, durum in test_rooms:
            execute_query('''
                INSERT INTO odalar (oda_numarasi, oda_tipi, manzara, ucret_gecelik, durum)
                VALUES (%s, %s, %s, %s, %s)
            ''', (room_no, tip, manzara, fiyat, durum))

        print(f"{len(test_rooms)} test odası başarıyla eklendi!")

    except Exception as e:
        print(f"Test odaları eklenirken hata: {e}")

def add_test_customers():
    """Test müşterileri ekler"""
    try:
        print("\n=== TEST MÜŞTERİLERİ EKLEME ===")

        # Mevcut müşteri sayısını kontrol et
        result = execute_query('SELECT COUNT(*) as total FROM musteriler')
        current_count = result[0]['total']
        print(f"Mevcut müşteri sayısı: {current_count}")

        if current_count > 0:
            print("Zaten müşteriler var, yeni müşteri eklenmeyecek.")
            return

        # Test müşterileri ekle
        test_customers = [
            ('Ahmet', 'Yılmaz', '555-0101', 'ahmet@email.com', 'İstanbul'),
            ('Ayşe', 'Kara', '555-0102', 'ayse@email.com', 'Ankara'),
            ('Mehmet', 'Öztürk', '555-0103', 'mehmet@email.com', 'İzmir'),
            ('Fatma', 'Demir', '555-0104', 'fatma@email.com', 'Antalya'),
            ('Ali', 'Çelik', '555-0105', 'ali@email.com', 'Bursa')
        ]

        for ad, soyad, telefon, email, adres in test_customers:
            execute_query('''
                INSERT INTO musteriler (ad, soyad, telefon, email, adres)
                VALUES (%s, %s, %s, %s, %s)
            ''', (ad, soyad, telefon, email, adres))

        print(f"{len(test_customers)} test müşterisi başarıyla eklendi!")

    except Exception as e:
        print(f"Test müşterileri eklenirken hata: {e}")

if __name__ == "__main__":
    add_test_rooms()
    add_test_customers()
    print("\nTest verileri ekleme tamamlandı!")

