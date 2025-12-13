from typing import Optional, Dict, Any

class EkstraHizmet:
    """Ekstra Hizmet modeli - PyMySQL tabanli"""

    def __init__(self, hizmet_id: Optional[int] = None, hizmet_adi: str = "",
                 birim_fiyat: float = 0.0, kategori: Optional[str] = None):
        self.hizmet_id = hizmet_id
        self.hizmet_adi = hizmet_adi
        self.birim_fiyat = birim_fiyat
        self.kategori = kategori

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'EkstraHizmet':
        """Dictionary'den EkstraHizmet objesi olusturur"""
        return cls(
            hizmet_id=data.get('hizmet_id'),
            hizmet_adi=data.get('hizmet_adi', ''),
            birim_fiyat=float(data.get('birim_fiyat', 0.0)),
            kategori=data.get('kategori')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e cevirir"""
        return {
            'hizmet_id': self.hizmet_id,
            'hizmet_adi': self.hizmet_adi,
            'birim_fiyat': self.birim_fiyat,
            'kategori': self.kategori
        }

