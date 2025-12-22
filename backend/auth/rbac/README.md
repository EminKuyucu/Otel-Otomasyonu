# Role-Based Access Control (RBAC) System

Bu sistem, personel tablosundaki `gorev` alanını kullanarak rol tabanlı erişim kontrolü sağlar.

## Rol Tanımları

### Normalized Roles
- **SUPER_ADMIN**: Genel Müdür - Tüm erişim
- **ADMIN**: Yönetici - Geniş erişim
- **RECEPTION_ADMIN**: Resepsiyon Şefi - Resepsiyon yönetimi
- **RECEPTION**: Resepsiyonist - Temel resepsiyon işlemleri
- **STAFF**: Diğer personel - Sınırlı erişim

### Rol Mapping
```
'Genel Müdür' -> SUPER_ADMIN
'Yönetici' -> ADMIN
'Resepsiyon Şefi' -> RECEPTION_ADMIN
'Resepsiyonist' -> RECEPTION
Diğer tüm değerler -> STAFF
```

## İzinler (Permissions)

### SUPER_ADMIN
- Tüm tablo ve view'lara tam erişim

### ADMIN
- **Tam erişim**: personel, musteriler, odalar, rezervasyonlar, odemeler, ekstra_hizmetler, musteri_harcamalari
- **Salt okuma**: raporlar (views)

### RECEPTION_ADMIN / RECEPTION
- **CRUD**: rezervasyonlar, musteriler
- **Salt okuma**: odalar, ekstra_hizmetler
- **Erişim yok**: personel, odemeler, depo_stok, raporlar

### STAFF
- **Sınırlı okuma**: rezervasyonlar (sadece kendi işlemleri)
- **Erişim yok**: diğer tüm tablolar

## Kullanım

### Backend

```python
from auth.rbac.decorators import read_required, write_required, delete_required

@bp.route('/protected')
@token_required
@read_required('personel')  # Sadece personel okuma izni olanlar
def protected_route(current_user):
    return jsonify({'data': 'protected'})
```

### Frontend

```jsx
import RoleGuard, { ROLES } from './components/RoleGuard'

<Route path="/admin" element={
  <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
    <AdminPanel />
  </RoleGuard>
} />
```

## Güvenlik

- **Backend-only authorization**: Tüm izin kontrolleri backend'de yapılır
- **Frontend sadece UI/UX**: Erişim engelleme sadece kullanıcı deneyimi için
- **JWT payload**: Rol bilgisi token'da saklanır
- **403 Forbidden**: Yetkisiz erişimlerde HTTP 403 döner

## Test

Sistem farklı rollerde test edilebilir:

```bash
# SUPER_ADMIN girişi
POST /api/login
{
  "email": "genel_mudur",
  "password": "12345"
}

# STAFF girişi
POST /api/login
{
  "email": "temizlikci",
  "password": "12345"
}
```
