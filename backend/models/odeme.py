from datetime import datetime
from typing import Optional, Dict, Any

class Odeme:
    """Odeme modeli - PyMySQL tabanli"""

    ODEME_NAKIT = 'Nakit'
    ODEME_KREDI_KARTI = 'Kredi Kartı'
    ODEME_HAVALE = 'Havale'
    ODEME_SANAL_POS = 'Sanal Pos'

    ODEME_TURU_CHOICES = [ODEME_NAKIT, ODEME_KREDI_KARTI, ODEME_HAVALE, ODEME_SANAL_POS]

    def __init__(self, odeme_id: Optional[int] = None, rezervasyon_id: int = 0,
                 odenen_tutar: float = 0.0, odeme_turu: str = ODEME_NAKIT,
                 odeme_tarihi: Optional[datetime] = None):
        self.odeme_id = odeme_id
        self.rezervasyon_id = rezervasyon_id
        self.odenen_tutar = odenen_tutar
        self.odeme_turu = odeme_turu
        self.odeme_tarihi = odeme_tarihi or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Odeme':
        """Dictionary'den Odeme objesi olusturur"""
        return cls(
            odeme_id=data.get('odeme_id'),
            rezervasyon_id=data.get('rezervasyon_id', 0),
            odenen_tutar=float(data.get('odenen_tutar', 0.0)),
            odeme_turu=data.get('odeme_turu', cls.ODEME_NAKIT),
            odeme_tarihi=data.get('odeme_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e cevirir"""
        return {
            'odeme_id': self.odeme_id,
            'rezervasyon_id': self.rezervasyon_id,
            'odenen_tutar': self.odenen_tutar,
            'odeme_turu': self.odeme_turu,
            'odeme_tarihi': self.odeme_tarihi.isoformat() if self.odeme_tarihi else None
        }

    def validate_odeme_turu(self, odeme_turu: str) -> bool:
        """Odeme turu degerinin gecerli olup olmadigini kontrol eder"""
        return odeme_turu in self.ODEME_TURU_CHOICES

