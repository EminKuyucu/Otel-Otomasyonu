#!/usr/bin/env python3
"""Oda filtreleme testi"""

import sys
import os
sys.path.append('.')

from services.oda_service import OdaService
from models.sqlalchemy_base import db_session

def test_filtering():
    """Filtreleme fonksiyonlarını test et"""
    db = db_session()
    try:
        print("Testing OdaService filtering...")

        # Tüm odaları getir
        all_rooms = OdaService.get_filtered_odalar(db)
        print(f"Total rooms: {len(all_rooms)}")

        # Arama ile test
        search_rooms = OdaService.get_filtered_odalar(db, arama='101')
        print(f"Rooms with search '101': {len(search_rooms)}")

        # Durum filtresi ile test
        empty_rooms = OdaService.get_filtered_odalar(db, durum='Boş')
        print(f"Empty rooms: {len(empty_rooms)}")

        # Oda tipi filtresi ile test
        double_rooms = OdaService.get_filtered_odalar(db, oda_tipi='Çift')
        print(f"Double rooms: {len(double_rooms)}")

        print("All tests completed successfully!")

    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_filtering()
