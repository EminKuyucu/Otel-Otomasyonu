from datetime import datetime
from typing import Optional, Dict, Any


class SilinenRezervasyonLog:
    """Silinen rezervasyon log modeli - PyMySQL tabanli"""

    def __init__(
        self,
        log_id: Optional[int] = None,
        rezervasyon_id: Optional[int] = None,
        musteri_id: Optional[int] = None,
        silinme_tarihi: Optional[datetime] = None,
        sebep: str = 'Kullanici tarafindan silindi'
    ):
        self.log_id = log_id
        self.rezervasyon_id = rezervasyon_id
        self.musteri_id = musteri_id
        self.silinme_tarihi = silinme_tarihi or datetime.utcnow()
        self.sebep = sebep

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SilinenRezervasyonLog':
        return cls(
            log_id=data.get('log_id'),
            rezervasyon_id=data.get('rezervasyon_id'),
            musteri_id=data.get('musteri_id'),
            silinme_tarihi=data.get('silinme_tarihi'),
            sebep=data.get('sebep', 'Kullanici tarafindan silindi')
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            'log_id': self.log_id,
            'rezervasyon_id': self.rezervasyon_id,
            'musteri_id': self.musteri_id,
            'silinme_tarihi': self.silinme_tarihi.isoformat() if self.silinme_tarihi else None,
            'sebep': self.sebep
        }

