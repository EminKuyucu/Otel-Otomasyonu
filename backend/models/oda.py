from datetime import datetime
from typing import Optional, Dict, Any

class Oda:
    """Oda modeli - PyMySQL tabanlı"""

    # Durum sabitlikleri
    DURUM_BOS = 'Boş'
    DURUM_DOLU = 'Dolu'
    DURUM_TADILAT = 'Tadilat'
    DURUM_TEMIZLIKTE = 'Temizlikte'
    DURUM_REZERVE = 'Rezerve'
    DURUM_CHOICES = [DURUM_BOS, DURUM_DOLU, DURUM_TADILAT, DURUM_TEMIZLIKTE, DURUM_REZERVE]

    # Oda tipi sabitlikleri
    TIPO_STANDART = 'Standart'
    TIPO_DELUXE = 'Deluxe'
    TIPO_SUITE = 'Suite'
    TIPO_VIPUITE = 'VIP Suite'
    TIPO_ENGELLI_ODASI = 'Engelli Odası'
    TIPO_SINGLE_ECONOMY = 'Single Economy'
    TIPO_AILE = 'Aile'
    TIPO_CONNECTION_ROOM = 'Connection Room'
    TIPO_CORNER_SUIT = 'Corner Suit'
    TIPO_BALAYI_SUITI = 'Balayı Suiti'
    TIPO_PENTHOUSE = 'Penthouse'
    TIPO_KRAL_DAIRESI = 'Kral Dairesi'
    TIPO_CHOICES = [TIPO_STANDART, TIPO_DELUXE, TIPO_SUITE, TIPO_VIPUITE, TIPO_ENGELLI_ODASI, TIPO_SINGLE_ECONOMY, TIPO_AILE, TIPO_CONNECTION_ROOM, TIPO_CORNER_SUIT, TIPO_BALAYI_SUITI, TIPO_PENTHOUSE, TIPO_KRAL_DAIRESI]

    def __init__(self, oda_id: Optional[int] = None, oda_numarasi: str = "",
                 oda_tipi: str = "", ucret_gecelik: float = 0.0, durum: str = DURUM_BOS,
                 manzara: str = "", metrekare: Optional[int] = None,
                 olusturulma_tarihi: Optional[datetime] = None):
        self.oda_id = oda_id
        self.oda_numarasi = oda_numarasi
        self.oda_tipi = oda_tipi
        self.ucret_gecelik = ucret_gecelik
        self.durum = durum
        self.manzara = manzara
        self.metrekare = metrekare
        self.olusturulma_tarihi = olusturulma_tarihi or datetime.utcnow()

    # Frontend uyumluluğu için properties
    @property
    def oda_no(self):
        return self.oda_numarasi
    
    @oda_no.setter
    def oda_no(self, value):
        self.oda_numarasi = value
    
    @property
    def tip(self):
        return self.oda_tipi
    
    @tip.setter
    def tip(self, value):
        self.oda_tipi = value
    
    @property
    def fiyat(self):
        return self.ucret_gecelik
    
    @fiyat.setter
    def fiyat(self, value):
        self.ucret_gecelik = value

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Oda':
        """Dictionary'den Oda objesi oluşturur"""
        # Frontend/routes alanlarını (oda_no, tip, fiyat) destekle
        oda_no = data.get('oda_no') or data.get('oda_numarasi', '')
        tip = data.get('tip') or data.get('oda_tipi', '')
        fiyat = data.get('fiyat') or data.get('ucret_gecelik', 0.0)
        
        # Fiyatı float'a dönüştür
        try:
            fiyat = float(fiyat) if fiyat else 0.0
        except (ValueError, TypeError):
            fiyat = 0.0
        
        # Metrekare'yi parse et
        metrekare = data.get('metrekare')
        try:
            metrekare = int(metrekare) if metrekare is not None else None
        except (ValueError, TypeError):
            metrekare = None

        return cls(
            oda_id=data.get('oda_id'),
            oda_numarasi=oda_no,
            oda_tipi=tip,
            ucret_gecelik=fiyat,
            durum=data.get('durum', cls.DURUM_BOS),
            manzara=data.get('manzara', ''),
            metrekare=metrekare,
            olusturulma_tarihi=data.get('olusturulma_tarihi')
        )

    def to_dict(self) -> Dict[str, Any]:
        """Objeyi dictionary'e çevirir"""
        return {
            'oda_id': self.oda_id,
            'oda_numarasi': self.oda_numarasi,
            'oda_tipi': self.oda_tipi,
            'manzara': self.manzara,
            'metrekare': self.metrekare,
            'ucret_gecelik': self.ucret_gecelik,
            'durum': self.durum,
            # Frontend uyumluluğu için alias'lar
            'oda_no': self.oda_numarasi,
            'tip': self.oda_tipi,
            'fiyat': self.ucret_gecelik,
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

    def validate_type(self, tipo: str) -> bool:
        """Oda tipi değerinin geçerli olup olmadığını kontrol eder"""
        return tipo in self.TIPO_CHOICES

