import sys
sys.path.append('backend')
from database import execute_query

try:
    # Odalar tablosu kontrolü
    result = execute_query('SELECT COUNT(*) as total FROM odalar')
    print(f'Odalar tablosundaki toplam kayıt sayısı: {result[0]["total"]}')

    # İlk 10 oda kaydı
    result = execute_query('SELECT * FROM odalar LIMIT 10')
    print('\nİlk 10 oda kaydı:')
    for room in result:
        print(f'Oda ID: {room["oda_id"]}, No: {room["oda_numarasi"]}, Tip: {room["oda_tipi"]}, Durum: {room["durum"]}, Manzara: {room["manzara"]}, Fiyat: {room["ucret_gecelik"]}')

    # Diğer tablolar kontrolü
    tables = ['musteriler', 'rezervasyonlar']
    for table in tables:
        try:
            result = execute_query(f'SELECT COUNT(*) as total FROM {table}')
            print(f'\n{table} tablosundaki toplam kayıt sayısı: {result[0]["total"]}')
        except Exception as e:
            print(f'\n{table} tablosu kontrol edilemedi: {e}')

except Exception as e:
    print(f'Hata: {e}')
