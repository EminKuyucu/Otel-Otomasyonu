from datetime import datetime
from typing import Optional, Dict, Any

class DepoStok:
    """Depo Stok modeli - PyMySQL tabanli"""

    def __init__(self, urun_id: Optional[int] = None, hizmet_id: Optional[int] = None,
                 urun_adi: str = "", stok_adedi: int = 0,
                 son_guncelleme: Optional[datetime] = None):
        self.urun_id = urun_id
        self.hizmet_id = hizmet_id
        self.urun_adi = urun_adi
        self.stok_adedi = stok_adedi
        self.son_guncelleme = son_guncelleme or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'DepoStok':
        """Dictionary'den DepoStok objesi olusturur"""
        return cls(
            urun_id=data.get('urun_id'),
            hizmet_id=data.get('hizmet_id'),
            urun_adi=data.get('urun_adi', ''),
            stok_adedi=data.get('stok_adedi', 0),
            son_guncelleme=data.get('son_guncelleme')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e cevirir"""
        return {
            'urun_id': self.urun_id,
            'hizmet_id': self.hizmet_id,
            'urun_adi': self.urun_adi,
            'stok_adedi': self.stok_adedi,
            'son_guncelleme': self.son_guncelleme.isoformat() if self.son_guncelleme else None
        }

    def can_decrease(self, miktar: int) -> bool:
        """Stok azaltilabilir mi kontrol eder"""
        return self.stok_adedi >= miktar

