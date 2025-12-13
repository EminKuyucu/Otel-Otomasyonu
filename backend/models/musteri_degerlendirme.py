from typing import Optional, Dict, Any

class MusteriDegerlendirme:
    """Musteri Degerlendirme modeli - PyMySQL tabanli"""

    def __init__(self, degerlendirme_id: Optional[int] = None, rezervasyon_id: Optional[int] = None,
                 puan: Optional[int] = None, yorum: Optional[str] = None):
        self.degerlendirme_id = degerlendirme_id
        self.rezervasyon_id = rezervasyon_id
        self.puan = puan
        self.yorum = yorum

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'MusteriDegerlendirme':
        """Dictionary'den MusteriDegerlendirme objesi olusturur"""
        return cls(
            degerlendirme_id=data.get('degerlendirme_id'),
            rezervasyon_id=data.get('rezervasyon_id'),
            puan=data.get('puan'),
            yorum=data.get('yorum')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e cevirir"""
        return {
            'degerlendirme_id': self.degerlendirme_id,
            'rezervasyon_id': self.rezervasyon_id,
            'puan': self.puan,
            'yorum': self.yorum
        }

