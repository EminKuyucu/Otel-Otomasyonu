from datetime import datetime
from typing import Optional, Dict, Any

class Personel:
    """Personel modeli - PyMySQL tabanlı"""

    def __init__(self, personel_id: Optional[int] = None, kullanici_adi: str = "",
                 sifre: str = "", ad_soyad: str = "", gorev: str = "Personel",
                 aktiflik: bool = True, olusturulma_tarihi: Optional[datetime] = None):
        self.personel_id = personel_id
        self.kullanici_adi = kullanici_adi
        self.sifre = sifre
        self.ad_soyad = ad_soyad
        self.gorev = gorev
        self.aktiflik = aktiflik
        self.olusturulma_tarihi = olusturulma_tarihi or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Personel':
        """Dictionary'den Personel objesi oluşturur"""
        return cls(
            personel_id=data.get('personel_id'),
            kullanici_adi=data.get('kullanici_adi', ''),
            sifre=data.get('sifre', ''),
            ad_soyad=data.get('ad_soyad', ''),
            gorev=data.get('gorev', 'Personel'),
            aktiflik=data.get('aktiflik', True),
            olusturulma_tarihi=data.get('olusturulma_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e çevirir"""
        return {
            'personel_id': self.personel_id,
            'kullanici_adi': self.kullanici_adi,
            'ad_soyad': self.ad_soyad,
            'gorev': self.gorev,
            'aktiflik': self.aktiflik,
            'olusturulma_tarihi': self.olusturulma_tarihi.isoformat() if self.olusturulma_tarihi else None
        }

    def to_db_dict(self) -> Dict[str, Any]:
        """Veritabanı için dictionary formatı"""
        data = self.to_dict()
        # personel_id'yi çıkar (AUTO_INCREMENT için)
        if 'personel_id' in data:
            del data['personel_id']
        return data

