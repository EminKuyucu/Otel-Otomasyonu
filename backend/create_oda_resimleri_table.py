#!/usr/bin/env python3
"""
Oda resimleri tablosunu oluştur
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import execute_query, init_database

# Oda resimleri tablosu oluştur
create_table_query = '''
CREATE TABLE IF NOT EXISTS oda_resimleri (
    resim_id INT PRIMARY KEY AUTO_INCREMENT,
    oda_id INT NOT NULL,
    resim_url VARCHAR(500) NOT NULL,
    resim_adi VARCHAR(255),
    sira INT DEFAULT 0,
    yuklenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (oda_id) REFERENCES odalar(oda_id) ON DELETE CASCADE,
    INDEX idx_oda_id (oda_id),
    INDEX idx_sira (sira)
)
'''

# Veritabanı bağlantısını başlat
init_database()

try:
    # Tabloyu oluştur
    execute_query(create_table_query, fetch=False)
    print('✅ oda_resimleri tablosu başarıyla oluşturuldu')

    # Örnek resim verilerini ekle
    sample_images = [
        {
            'oda_id': 1,
            'resim_url': 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
            'resim_adi': 'Oda 101 - Deniz Manzarası',
            'sira': 0
        },
        {
            'oda_id': 1,
            'resim_url': 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
            'resim_adi': 'Oda 101 - Yatak Odası',
            'sira': 1
        },
        {
            'oda_id': 1,
            'resim_url': 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
            'resim_adi': 'Oda 101 - Banyo',
            'sira': 2
        },
        {
            'oda_id': 2,
            'resim_url': 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=800',
            'resim_adi': 'Oda 102 - Bahçe Manzarası',
            'sira': 0
        },
        {
            'oda_id': 2,
            'resim_url': 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=800',
            'resim_adi': 'Oda 102 - Oturma Alanı',
            'sira': 1
        }
    ]

    for img in sample_images:
        try:
            insert_query = """
            INSERT INTO oda_resimleri (oda_id, resim_url, resim_adi, sira)
            VALUES (%s, %s, %s, %s)
            """
            execute_query(insert_query, params=(
                img['oda_id'], img['resim_url'], img['resim_adi'], img['sira']
            ), fetch=False)
            print(f"✅ {img['resim_adi']} eklendi")
        except Exception as e:
            print(f"⚠️ {img['resim_adi']} eklenirken hata: {e}")

    print('✅ Örnek oda resimleri başarıyla eklendi')

except Exception as e:
    print(f'❌ İşlem hatası: {e}')
