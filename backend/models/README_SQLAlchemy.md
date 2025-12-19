# SQLAlchemy ORM Modelleri

Bu dizin mevcut PyMySQL tabanlı sistemi etkilemeden SQLAlchemy ORM modellerini içerir.

## Kurulum

1. **SQLAlchemy'yi güncelleyin** (Python 3.13 uyumluluğu için):
```bash
pip install SQLAlchemy==2.0.32
```

2. **Modelleri test edin**:
```bash
python test_sqlalchemy_models.py
```

## Kullanım

SQLAlchemy modellerini kullanmak için:

```python
# Direkt import (test edilmiş SQLAlchemy kurulumundan sonra)
from models.sqlalchemy_base import db_session, get_db
from models.sqlalchemy_models import Personel, Musteri, Oda

# Örnek kullanım
def create_personel():
    with db_session() as session:
        personel = Personel(
            kullanici_adi="admin",
            sifre="hashed_password",
            ad_soyad="Admin User",
            gorev="Yönetici"
        )
        session.add(personel)
        session.commit()
        return personel

# Alternatif: get_db() generator ile
def get_personel_list():
    with get_db() as db:
        return db.query(Personel).all()
```

## Mevcut Sistemle Paralel Kullanım

Mevcut PyMySQL modelleriniz etkilenmeden SQLAlchemy modellerini kullanabilirsiniz:

```python
# PyMySQL modelleri (mevcut sistem)
from models import Personel  # Bu hala çalışıyor

# SQLAlchemy modelleri (yeni sistem)
from models.sqlalchemy_models import Personel as SQLPersonel
```

## Modeller

### Ana Modeller
- `Personel` - Personel tablosu
- `Musteri` - Müşteriler tablosu
- `Oda` - Odalar tablosu
- `Rezervasyon` - Rezervasyonlar tablosu
- `Odeme` - Ödemeler tablosu

### İlişkili Modeller
- `OdaOzelligi` - Oda özellikleri
- `OdaOzellikBaglanti` - Oda-özellik bağlantıları
- `EkstraHizmet` - Ekstra hizmetler
- `MusteriHarcama` - Müşteri harcamaları
- `DepoStok` - Depo stok
- `MusteriDegerlendirme` - Müşteri değerlendirmeleri
- `SilinenRezervasyonLog` - Silinen rezervasyon logları

## Önemli Notlar

- SQLAlchemy modelleri mevcut PyMySQL sisteminizi **hiç etkilemez**
- Tüm modeller MySQL tablo şemanıza %100 uyumludur
- Foreign key ilişkileri tanımlanmıştır
- Veritabanı bağlantısı mevcut `DATABASE_URI` çevre değişkenini kullanır
