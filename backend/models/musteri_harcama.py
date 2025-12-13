from datetime import datetime
from typing import Optional, Dict, Any

class MusteriHarcama:
    """Musteri Harcama modeli - PyMySQL tabanli"""

    def __init__(self, harcama_id: Optional[int] = None, rezervasyon_id: int = 0,
                 hizmet_id: int = 0, adet: int = 1, toplam_fiyat: float = 0.0,
                 islem_tarihi: Optional[datetime] = None):
        self.harcama_id = harcama_id
        self.rezervasyon_id = rezervasyon_id
        self.hizmet_id = hizmet_id
        self.adet = adet
        self.toplam_fiyat = toplam_fiyat
        self.islem_tarihi = islem_tarihi or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MusteriHarcama':
        """Dictionary'den MusteriHarcama objesi olusturur"""
        return cls(
            harcama_id=data.get('harcama_id'),
            rezervasyon_id=data.get('rezervasyon_id', 0),
            hizmet_id=data.get('hizmet_id', 0),
            adet=data.get('adet', 1),
            toplam_fiyat=float(data.get('toplam_fiyat', 0.0)),
            islem_tarihi=data.get('islem_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e cevirir"""
        return {
            'harcama_id': self.harcama_id,
            'rezervasyon_id': self.rezervasyon_id,
            'hizmet_id': self.hizmet_id,
            'adet': self.adet,
            'toplam_fiyat': self.toplam_fiyat,
            'islem_tarihi': self.islem_tarihi.isoformat() if self.islem_tarihi else None
        }

