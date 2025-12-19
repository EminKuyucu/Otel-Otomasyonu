#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Database'deki mevcut verileri kontrol etmek için script
"""

import sys
import os
sys.path.append('.')

from database import execute_query

def check_database():
    """Database'deki mevcut verileri kontrol eder"""
    try:
        # Odalar tablosu
        print("=== ODALAR TABLOSU ===")
        result = execute_query('SELECT COUNT(*) as total FROM odalar')
        total_rooms = result[0]['total']
        print(f"Toplam oda sayısı: {total_rooms}")

        if total_rooms > 0:
            rooms = execute_query('SELECT * FROM odalar LIMIT 5')
            print("\nİlk 5 oda:")
            for room in rooms:
                print(f"  ID: {room['oda_id']}, No: {room['oda_numarasi']}, Tip: {room['oda_tipi']}, Durum: {room['durum']}, Manzara: {room['manzara']}, Fiyat: {room['ucret_gecelik']}")

        # Müşteriler tablosu
        print("\n=== MÜŞTERİLER TABLOSU ===")
        result = execute_query('SELECT COUNT(*) as total FROM musteriler')
        total_customers = result[0]['total']
        print(f"Toplam müşteri sayısı: {total_customers}")

        if total_customers > 0:
            customers = execute_query('SELECT * FROM musteriler LIMIT 3')
            print("\nİlk 3 müşteri:")
            for customer in customers:
                print(f"  ID: {customer['musteri_id']}, Ad: {customer['ad']}, Soyad: {customer['soyad']}, Telefon: {customer['telefon']}")

        # Rezervasyonlar tablosu
        print("\n=== REZERVASYONLAR TABLOSU ===")
        result = execute_query('SELECT COUNT(*) as total FROM rezervasyonlar')
        total_reservations = result[0]['total']
        print(f"Toplam rezervasyon sayısı: {total_reservations}")

        if total_reservations > 0:
            reservations = execute_query('SELECT * FROM rezervasyonlar LIMIT 3')
            print("\nİlk 3 rezervasyon:")
            for res in reservations:
                print(f"  ID: {res['rezervasyon_id']}, Müşteri ID: {res['musteri_id']}, Oda ID: {res['oda_id']}, Giriş: {res['giris_tarihi']}, Çıkış: {res['cikis_tarihi']}")

    except Exception as e:
        print(f"Database kontrol hatası: {e}")

if __name__ == "__main__":
    check_database()
