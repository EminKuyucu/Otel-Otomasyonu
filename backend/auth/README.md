# Authentication System

Personel giriş sistemi ve JWT token tabanlı kimlik doğrulama.

## Özellikler

- Email + şifre ile giriş
- Bcrypt ile şifre hashleme
- JWT token üretimi ve doğrulama
- Token tabanlı route koruması
- Otomatik token süresi kontrolü

## Kullanım

### 1. Giriş Yapma

```bash
POST /api/login
Content-Type: application/json

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

**Başarısız Yanıt (401):**
```json
{
  "error": "Giriş başarısız",
  "message": "Email veya şifre hatalı"
}
```

### 2. Korumalı Route Kullanımı

Korumalı route'larda token göndermek için:

```bash
GET /api/personel
Authorization: Bearer <token>
```

### 3. Token Decorator Kullanımı

```python
from auth.jwt_utils import token_required

@bp.route('/protected')
@token_required
def protected_route(current_user):
    # current_user içinde token payload bilgileri var
    personel_id = current_user['personel_id']
    kullanici_adi = current_user['kullanici_adi']
    gorev = current_user['gorev']
    
    return jsonify({'message': 'Başarılı'})
```

## Token Yapısı

Token içeriği:
- `personel_id`: Personel ID'si
- `kullanici_adi`: Kullanıcı adı
- `gorev`: Personel görevi
- `exp`: Token sona erme zamanı (24 saat)
- `iat`: Token oluşturulma zamanı

## Şifre Hashleme

Yeni personel oluştururken şifre otomatik hashlenir:

```python
from auth.password_utils import hash_password

hashed_password = hash_password("12345")
```

## Notlar

- Token süresi: 24 saat
- Tüm API endpoint'leri (login hariç) token gerektirir
- Token `Authorization: Bearer <token>` formatında gönderilmelidir
- Şifreler bcrypt ile hashlenir ve düz metin olarak saklanmaz








