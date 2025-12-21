#!/usr/bin/env python3
"""Dashboard API testi"""

import sys
import os
sys.path.append('.')

from database import test_connection, execute_query, init_database
from flask import Flask

def test_dashboard_without_auth():
    """Authentication olmadan dashboard verilerini test eder"""

    print("Dashboard Veritabanı Testi:")
    print("-" * 40)

    try:
        # Veritabanı bağlantısını başlat
        init_database()
        print("✅ Veritabanı bağlantısı başlatıldı!")

        # Veritabanı bağlantısını test et
        test_connection()
        print("✅ Veritabanı bağlantısı başarılı!")
        print()

        # Dashboard sorgularını direkt test et
        print("Dashboard İstatistikleri Testi:")
        print("-" * 30)

        # Toplam rezervasyon sayısı
        total_reservations_query = "SELECT COUNT(*) as count FROM rezervasyonlar"
        total_reservations_result = execute_query(total_reservations_query, fetch=True)
        total_reservations = total_reservations_result[0]['count'] if total_reservations_result else 0
        print(f"📊 Toplam Rezervasyon: {total_reservations}")

        # Dolu oda sayısı
        occupied_rooms_query = "SELECT COUNT(*) as count FROM odalar WHERE durum = 'Dolu'"
        occupied_rooms_result = execute_query(occupied_rooms_query, fetch=True)
        occupied_rooms = occupied_rooms_result[0]['count'] if occupied_rooms_result else 0
        print(f"🏨 Dolu Odalar: {occupied_rooms}")

        # Müsait oda sayısı
        available_rooms_query = "SELECT COUNT(*) as count FROM odalar WHERE durum = 'Boş'"
        available_rooms_result = execute_query(available_rooms_query, fetch=True)
        available_rooms = available_rooms_result[0]['count'] if available_rooms_result else 0
        print(f"🏠 Müsait Odalar: {available_rooms}")

        # Bugün giriş yapacak müşteri sayısı
        import datetime
        today = datetime.date.today().isoformat()
        todays_checkins_query = """
            SELECT COUNT(*) as count
            FROM rezervasyonlar
            WHERE DATE(giris_tarihi) = %s AND rezervasyon_durumu IN ('Aktif', 'Bekliyor')
        """
        todays_checkins_result = execute_query(todays_checkins_query, params=(today,), fetch=True)
        todays_checkins = todays_checkins_result[0]['count'] if todays_checkins_result else 0
        print(f"📅 Bugün Giriş: {todays_checkins}")

        # Toplam müşteri sayısı
        total_customers_query = "SELECT COUNT(*) as count FROM musteriler"
        total_customers_result = execute_query(total_customers_query, fetch=True)
        total_customers = total_customers_result[0]['count'] if total_customers_result else 0
        print(f"👥 Toplam Müşteri: {total_customers}")

        # Doluluk oranı hesaplama
        total_rooms_query = "SELECT COUNT(*) as count FROM odalar"
        total_rooms_result = execute_query(total_rooms_query, fetch=True)
        total_rooms = total_rooms_result[0]['count'] if total_rooms_result else 0

        occupancy_rate = 0
        if total_rooms > 0:
            occupancy_rate = round((occupied_rooms / total_rooms) * 100, 1)

        print(f"📈 Doluluk Oranı: %{occupancy_rate}")
        print(f"🏢 Toplam Oda: {total_rooms}")

        print()
        print("✅ Dashboard verileri başarıyla çekildi!")
        print("📋 Özet:")
        print(f"   - {total_reservations} rezervasyon")
        print(f"   - {occupied_rooms}/{total_rooms} oda dolu (%{occupancy_rate})")
        print(f"   - {available_rooms} oda müsait")
        print(f"   - {todays_checkins} bugün giriş yapacak")
        print(f"   - {total_customers} toplam müşteri")

        return True

    except Exception as e:
        print(f"❌ Test hatası: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("DASHBOARD VERİTABANI TESTİ")
    print("=" * 60)
    print()

    success = test_dashboard_without_auth()

    print()
    print("=" * 60)
    if success:
        print("🎉 TEST BAŞARILI - Dashboard verileri çalışıyor!")
        print("💡 Eğer frontend'de hala hata alıyorsanız:")
        print("   1. Backend'in çalıştığından emin olun")
        print("   2. Tarayıcıda http://localhost:5000/api/dashboard/stats test edin")
        print("   3. Login olup token aldığınızdan emin olun")
    else:
        print("❌ TEST BAŞARISIZ - Veritabanı veya sorgu hatası!")
    print("=" * 60)
