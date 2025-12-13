from datetime import datetime
from typing import Optional, Dict, Any

class Oda:
    """Oda modeli - PyMySQL tabanlı"""

    DURUM_BOS = 'bos'
    DURUM_DOLU = 'dolu'
    DURUM_TADILAT = 'tadilat'

    DURUM_CHOICES = [DURUM_BOS, DURUM_DOLU, DURUM_TADILAT]

    def __init__(self, oda_id: Optional[int] = None, oda_no: str = "",
                 tip: str = "", fiyat: float = 0.0, durum: str = DURUM_BOS,
                 olusturulma_tarihi: Optional[datetime] = None):
        self.oda_id = oda_id
        self.oda_no = oda_no
        self.tip = tip
        self.fiyat = fiyat
        self.durum = durum
        self.olusturulma_tarihi = olusturulma_tarihi or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Oda':
        """Dictionary'den Oda objesi oluşturur"""
        return cls(
            oda_id=data.get('oda_id'),
            oda_no=data.get('oda_no', ''),
            tip=data.get('tip', ''),
            fiyat=data.get('fiyat', 0.0),
            durum=data.get('durum', cls.DURUM_BOS),
            olusturulma_tarihi=data.get('olusturulma_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e çevirir"""
        return {
            'oda_id': self.oda_id,
            'oda_no': self.oda_no,
            'tip': self.tip,
            'fiyat': self.fiyat,
            'durum': self.durum,
            'olusturulma_tarihi': self.olusturulma_tarihi.isoformat() if self.olusturulma_tarihi else None
        }

    def to_db_dict(self) -> Dict[str, Any]:
        """Veritabanı için dictionary formatı"""
        data = self.to_dict()
        # oda_id'yi çıkar (AUTO_INCREMENT için)
        if 'oda_id' in data:
            del data['oda_id']
        return data

    def is_available(self) -> bool:
        """Oda müsait mi kontrol eder"""
        return self.durum == self.DURUM_BOS

    def validate_status(self, status: str) -> bool:
        """Durum değerinin geçerli olup olmadığını kontrol eder"""
        return status in self.DURUM_CHOICES

