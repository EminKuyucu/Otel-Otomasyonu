#!/usr/bin/env python3
import sys
import os

# Backend dizinini path'e ekle
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from models.oda import Oda

print('✅ Backend Oda durum seçenekleri:')
for durum in Oda.DURUM_CHOICES:
    print(f' - {durum}')

print()
print('✅ Frontend oda durum seçenekleri:')
frontend_durumlar = ['Boş', 'Dolu', 'Temizlikte', 'Tadilat', 'Rezerve']
for durum in frontend_durumlar:
    print(f' - {durum}')

print()
print('🎯 Karşılaştırma:')
backend_set = set(Oda.DURUM_CHOICES)
frontend_set = set(frontend_durumlar)

if backend_set == frontend_set:
    print('✅ Backend ve Frontend durumları eşleşiyor!')
else:
    print('❌ Uyumsuzluk var:')
    print(f'   Backend\'de olup Frontend\'de olmayan: {backend_set - frontend_set}')
    print(f'   Frontend\'de olup Backend\'de olmayan: {frontend_set - backend_set}')
