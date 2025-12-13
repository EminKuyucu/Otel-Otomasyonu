from datetime import datetime, date
from typing import Optional, Dict, Any


class Rezervasyon:
    """Rezervasyon modeli - PyMySQL tabanli"""

    DURUM_BEKLIYOR = 'bekliyor'
    DURUM_AKTIF = 'aktif'
    DURUM_TAMAMLANDI = 'tamamlandi'
    DURUM_IPTAL = 'iptal'

    DURUM_CHOICES = [DURUM_BEKLIYOR, DURUM_AKTIF, DURUM_TAMAMLANDI, DURUM_IPTAL]

    def __init__(
        self,
        rezervasyon_id: Optional[int] = None,
        musteri_id: int = 0,
        oda_id: int = 0,
        giris_tarihi: Optional[date] = None,
        cikis_tarihi: Optional[date] = None,
        yetiskin_sayisi: int = 1,
        cocuk_sayisi: int = 0,
        toplam_ucret: float = 0.0,
        rezervasyon_durumu: str = DURUM_AKTIF,
        olusturulma_tarihi: Optional[datetime] = None,
    ):
        self.rezervasyon_id = rezervasyon_id
        self.musteri_id = musteri_id
        self.oda_id = oda_id
        self.giris_tarihi = giris_tarihi
        self.cikis_tarihi = cikis_tarihi
        self.yetiskin_sayisi = yetiskin_sayisi
        self.cocuk_sayisi = cocuk_sayisi
        self.toplam_ucret = toplam_ucret
        self.rezervasyon_durumu = rezervasyon_durumu
        self.olusturulma_tarihi = olusturulma_tarihi or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Rezervasyon':
        """Dictionary'den Rezervasyon objesi olusturur"""
        return cls(
            rezervasyon_id=data.get('rezervasyon_id'),
            musteri_id=data.get('musteri_id', 0),
            oda_id=data.get('oda_id', 0),
            giris_tarihi=data.get('giris_tarihi'),
            cikis_tarihi=data.get('cikis_tarihi'),
            yetiskin_sayisi=data.get('yetiskin_sayisi', 1),
            cocuk_sayisi=data.get('cocuk_sayisi', 0),
            toplam_ucret=float(data.get('toplam_ucret', 0.0)) if data.get('toplam_ucret') is not None else 0.0,
            rezervasyon_durumu=data.get('rezervasyon_durumu', cls.DURUM_AKTIF),
            olusturulma_tarihi=data.get('olusturulma_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e cevirir"""
        return {
            'rezervasyon_id': self.rezervasyon_id,
            'musteri_id': self.musteri_id,
            'oda_id': self.oda_id,
            'giris_tarihi': self.giris_tarihi.isoformat() if isinstance(self.giris_tarihi, (datetime, date)) else self.giris_tarihi,
            'cikis_tarihi': self.cikis_tarihi.isoformat() if isinstance(self.cikis_tarihi, (datetime, date)) else self.cikis_tarihi,
            'yetiskin_sayisi': self.yetiskin_sayisi,
            'cocuk_sayisi': self.cocuk_sayisi,
            'toplam_ucret': self.toplam_ucret,
            'rezervasyon_durumu': self.rezervasyon_durumu,
            'olusturulma_tarihi': self.olusturulma_tarihi.isoformat() if self.olusturulma_tarihi else None
        }

    def validate_status(self, status: str) -> bool:
        """Durum degerinin gecerli olup olmadigini kontrol eder"""
        return status in self.DURUM_CHOICES

