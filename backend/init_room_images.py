#!/usr/bin/env python3
"""
Oda resimleri tablosunu oluştur ve örnek verileri ekle
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models.sqlalchemy_base import Base, engine
from models.sqlalchemy_models import OdaResim

# Tabloyu oluştur
Base.metadata.create_all(bind=engine)
print('✅ oda_resimleri tablosu oluşturuldu')

def init_room_images():
    try:
        # Tabloyu oluştur
        Base.metadata.create_all(bind=engine)
        print('✅ oda_resimleri tablosu oluşturuldu')

        # Örnek resim verilerini ekle
        from sqlalchemy.orm import sessionmaker
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()

        sample_images = [
            OdaResim(
                oda_id=1,
                resim_url='https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
                resim_adi='Oda 101 - Deniz Manzarası',
                sira=0
            ),
            OdaResim(
                oda_id=1,
                resim_url='https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
                resim_adi='Oda 101 - Yatak Odası',
                sira=1
            ),
            OdaResim(
                oda_id=1,
                resim_url='https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
                resim_adi='Oda 101 - Banyo',
                sira=2
            ),
            OdaResim(
                oda_id=2,
                resim_url='https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=800',
                resim_adi='Oda 102 - Bahçe Manzarası',
                sira=0
            ),
            OdaResim(
                oda_id=2,
                resim_url='https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
                resim_adi='Oda 102 - Oturma Alanı',
                sira=1
            )
        ]

        for img in sample_images:
            db.add(img)
            print(f"✅ {img.resim_adi} eklendi")

        db.commit()
        db.close()

        print('✅ Örnek oda resimleri başarıyla eklendi')

    except Exception as e:
        print(f'❌ Hata: {e}')

if __name__ == "__main__":
    init_room_images()
