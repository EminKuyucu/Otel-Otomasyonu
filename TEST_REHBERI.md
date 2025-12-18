# 🧪 Sistem Test Rehberi

Bu rehber, Otel Otomasyonu sistemini test etmek için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

1. ✅ Python 3.x yüklü olmalı
2. ✅ MySQL veritabanı çalışıyor olmalı
3. ✅ Veritabanı şeması oluşturulmuş olmalı
4. ✅ Node.js ve npm yüklü olmalı (frontend için)

## 🚀 Hızlı Başlangıç

### 1. Backend Kurulumu ve Başlatma

```bash
# Backend dizinine git
cd backend

# Virtual environment oluştur (ilk kez)
python -m venv venv

# Virtual environment'ı aktifleştir
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Bağımlılıkları yükle
pip install -r requirements.txt

# .env dosyası oluştur (eğer yoksa)
# DATABASE_URI=mysql+pymysql://root:password@localhost/otel_otomasyonu_pro
# JWT_SECRET_KEY=your-secret-key-here

# Backend'i başlat
python app.py
```

Backend `http://localhost:5000` adresinde çalışacaktır.

### 2. Backend Testi

**Terminal 1'de backend çalışırken, Terminal 2'de:**

```bash
# Test scriptini çalıştır
cd backend
python test_connection.py
```

Veya manuel olarak:

```bash
# API testi
curl http://localhost:5000/

# Veritabanı testi
curl http://localhost:5000/api/test-db

# Login testi
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"talha\",\"password\":\"12345\"}"
```

### 3. Frontend Kurulumu ve Başlatma

```bash
# Frontend dizinine git
cd frontend

# Bağımlılıkları yükle (ilk kez)
npm install

# Frontend'i başlat
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacaktır.

## 🔐 Login Testi

### Postman/Insomnia ile Test

**Endpoint:** `POST http://localhost:5000/api/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "talha",
  "password": "12345"
}
```

**Başarılı Yanıt (200):**
```json
{
  "message": "Giriş başarılı",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "personel_id": 1,
    "kullanici_adi": "talha",
    "ad_soyad": "Talha Dağ",
    "gorev": "Genel Müdür"
  }
}
```

### Token ile Korumalı Route Testi

**Endpoint:** `GET http://localhost:5000/api/personel`

**Headers:**
```
Authorization: Bearer <token_buraya>
Content-Type: application/json
```

## ⚠️ Yaygın Sorunlar ve Çözümleri

### 1. "ModuleNotFoundError: No module named 'flask'"

**Çözüm:**
```bash
cd backend
pip install -r requirements.txt
```

### 2. "Veritabanı bağlantı hatası"

**Kontrol Listesi:**
- MySQL servisi çalışıyor mu?
- `.env` dosyasında `DATABASE_URI` doğru mu?
- Veritabanı `otel_otomasyonu_pro` oluşturulmuş mu?
- Kullanıcı adı ve şifre doğru mu?

**Çözüm:**
```bash
# .env dosyasını kontrol et
# DATABASE_URI formatı: mysql+pymysql://kullanici:sifre@host/veritabani_adi
```

### 3. "Login başarısız (401)"

**Neden:** Şifreler hashlenmemiş olabilir.

**Çözüm:**
```bash
cd backend
python scripts/hash_existing_passwords.py
```

### 4. "CORS hatası"

**Çözüm:** Backend'de CORS zaten yapılandırılmış. Eğer sorun devam ederse, `app.py` dosyasında CORS ayarlarını kontrol edin.

### 5. "npm: command not found"

**Çözüm:** Node.js'i yükleyin: https://nodejs.org/

## 📊 Test Senaryoları

### Senaryo 1: Tam Sistem Testi

1. ✅ Backend başlatıldı mı?
2. ✅ Veritabanı bağlantısı çalışıyor mu?
3. ✅ Login endpoint çalışıyor mu?
4. ✅ Token üretiliyor mu?
5. ✅ Korumalı route'lar token ile çalışıyor mu?
6. ✅ Frontend başlatıldı mı?
7. ✅ Frontend backend'e bağlanabiliyor mu?

### Senaryo 2: API Endpoint Testleri

```bash
# 1. Ana sayfa
GET http://localhost:5000/

# 2. Veritabanı testi
GET http://localhost:5000/api/test-db

# 3. Login
POST http://localhost:5000/api/login

# 4. Personel listesi (token gerekli)
GET http://localhost:5000/api/personel
Authorization: Bearer <token>

# 5. Müşteri listesi (token gerekli)
GET http://localhost:5000/api/musteri
Authorization: Bearer <token>
```

## 🎯 Hızlı Kontrol Komutları

```bash
# Backend çalışıyor mu?
curl http://localhost:5000/

# Veritabanı bağlantısı?
curl http://localhost:5000/api/test-db

# Frontend çalışıyor mu?
curl http://localhost:3000/
```

## 📝 Notlar

- Backend portu: `5000`
- Frontend portu: `3000`
- Token süresi: 24 saat
- Tüm API endpoint'leri (login hariç) token gerektirir
- Şifreler bcrypt ile hashlenir

## 🆘 Yardım

Sorun yaşıyorsanız:
1. Backend loglarını kontrol edin
2. Veritabanı bağlantısını test edin
3. `.env` dosyasını kontrol edin
4. `test_connection.py` scriptini çalıştırın








