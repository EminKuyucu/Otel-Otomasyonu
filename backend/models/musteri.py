from datetime import datetime
from typing import Optional, Dict, Any

class Musteri:
    """Müşteri modeli - PyMySQL tabanlı"""

    CINSIYET_ERKEK = 'Erkek'
    CINSIYET_KADIN = 'Kadın'
    CINSIYET_BELIRTILMEMIS = 'Belirtilmemiş'

    CINSIYET_CHOICES = [CINSIYET_ERKEK, CINSIYET_KADIN, CINSIYET_BELIRTILMEMIS]

    def __init__(self, musteri_id: Optional[int] = None, ad: str = "",
                 soyad: str = "", tc_kimlik_no: str = "", telefon: str = "",
                 email: Optional[str] = None, cinsiyet: str = CINSIYET_BELIRTILMEMIS,
                 adres: Optional[str] = None, ozel_notlar: Optional[str] = None,
                 kayit_tarihi: Optional[datetime] = None):
        self.musteri_id = musteri_id
        self.ad = ad
        self.soyad = soyad
        self.tc_kimlik_no = tc_kimlik_no
        self.telefon = telefon
        self.email = email
        self.cinsiyet = cinsiyet
        self.adres = adres
        self.ozel_notlar = ozel_notlar
        self.kayit_tarihi = kayit_tarihi or datetime.utcnow()

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Musteri':
        """Dictionary'den Musteri objesi oluşturur"""
        return cls(
            musteri_id=data.get('musteri_id'),
            ad=data.get('ad', ''),
            soyad=data.get('soyad', ''),
            tc_kimlik_no=data.get('tc_kimlik_no', ''),
            telefon=data.get('telefon', ''),
            email=data.get('email'),
            cinsiyet=data.get('cinsiyet', cls.CINSIYET_BELIRTILMEMIS),
            adres=data.get('adres'),
            ozel_notlar=data.get('ozel_notlar'),
            kayit_tarihi=data.get('kayit_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e çevirir"""
        return {
            'musteri_id': self.musteri_id,
            'ad': self.ad,
            'soyad': self.soyad,
            'tc_kimlik_no': self.tc_kimlik_no,
            'telefon': self.telefon,
            'email': self.email,
            'cinsiyet': self.cinsiyet,
            'adres': self.adres,
            'ozel_notlar': self.ozel_notlar,
            'kayit_tarihi': self.kayit_tarihi.isoformat() if self.kayit_tarihi else None
        }

    def to_db_dict(self) -> Dict[str, Any]:
        """Veritabanı için dictionary formatı"""
        data = self.to_dict()
        # musteri_id'yi çıkar (AUTO_INCREMENT için)
        if 'musteri_id' in data:
            del data['musteri_id']
        return data

    def validate_gender(self, gender: str) -> bool:
        """Cinsiyet değerinin geçerli olup olmadığını kontrol eder"""
        return gender in self.CINSIYET_CHOICES

    @property
    def full_name(self) -> str:
        """Müşterinin tam adını döndürür"""
        return f"{self.ad} {self.soyad}"

