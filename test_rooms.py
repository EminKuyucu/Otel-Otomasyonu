import urllib.request
import json

# Odalar endpoint'ini test et
try:
    req = urllib.request.Request('http://localhost:5000/api/rooms')
    req.add_header('Authorization', 'Bearer test-token')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('✅ Odalar endpoint çalışıyor!')
        print(f'📊 Toplam {len(result)} oda bulundu')
        if result:
            print('📋 İlk oda örneği:', json.dumps(result[0], indent=2, ensure_ascii=False))
except Exception as e:
    print('❌ Hata:', e)
