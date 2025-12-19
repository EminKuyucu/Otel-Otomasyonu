"""
Oda servisi - SQLAlchemy ile oda filtreleme işlemlerini yönetir
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, String
from models.sqlalchemy_models import Oda
from models.sqlalchemy_base import get_db


class OdaService:
    """Oda servis sınıfı - SQLAlchemy ile oda işlemlerini yönetir"""

    @staticmethod
    def get_filtered_odalar(
        db: Session,
        durum: Optional[str] = None,
        oda_tipi: Optional[str] = None,
        min_fiyat: Optional[float] = None,
        max_fiyat: Optional[float] = None,
        arama: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Filtre parametrelerine göre odaları getirir

        Args:
            db: SQLAlchemy session
            durum: Oda durumu filtresi ('Boş', 'Dolu', vb.)
            oda_tipi: Oda tipi filtresi ('Tek', 'Çift', vb.)
            min_fiyat: Minimum fiyat filtresi
            max_fiyat: Maximum fiyat filtresi

        Returns:
            List[Dict[str, Any]]: Filtrelenmiş oda listesi
        """
        # Base query oluştur
        query = db.query(Oda)

        # Filtreleri ekle
        filters = []

        # Durum filtresi
        if durum:
            filters.append(Oda.durum == durum)

        # Oda tipi filtresi
        if oda_tipi:
            filters.append(Oda.oda_tipi == oda_tipi)

        # Fiyat aralığı filtresi
        if min_fiyat is not None:
            filters.append(Oda.ucret_gecelik >= min_fiyat)

        if max_fiyat is not None:
            filters.append(Oda.ucret_gecelik <= max_fiyat)

        # Tüm filtreleri uygula
        if filters:
            query = query.filter(and_(*filters))

        # Arama filtresi (oda numarası, tipi veya manzara)
        if arama:
            search_filter = or_(
                Oda.oda_numarasi.cast(String).like(f"%{arama}%"),
                Oda.oda_tipi.like(f"%{arama}%"),
                Oda.manzara.like(f"%{arama}%")
            )
            query = query.filter(search_filter)

        # Sıralama - oda numarasına göre
        query = query.order_by(Oda.oda_numarasi)

        # Sonuçları getir
        results = query.all()

        # Frontend formatına dönüştür
        odalar = []
        for oda in results:
            odalar.append({
                'oda_id': oda.oda_id,
                'oda_no': oda.oda_numarasi,
                'tip': oda.oda_tipi,
                'manzara': oda.manzara,
                'metrekare': oda.metrekare,
                'fiyat': float(oda.ucret_gecelik),
                'durum': oda.durum
            })

        return odalar

    @staticmethod
    def get_all_odalar(db: Session) -> List[Dict[str, Any]]:
        """
        Tüm odaları getirir (filtre olmadan)

        Args:
            db: SQLAlchemy session

        Returns:
            List[Dict[str, Any]]: Tüm oda listesi
        """
        return OdaService.get_filtered_odalar(db)

    @staticmethod
    def get_oda_by_id(db: Session, oda_id: int) -> Optional[Dict[str, Any]]:
        """
        ID'ye göre tek bir oda getirir

        Args:
            db: SQLAlchemy session
            oda_id: Oda ID'si

        Returns:
            Optional[Dict[str, Any]]: Oda bilgisi veya None
        """
        oda = db.query(Oda).filter(Oda.oda_id == oda_id).first()

        if not oda:
            return None

        return {
            'oda_id': oda.oda_id,
            'oda_no': oda.oda_numarasi,
            'tip': oda.oda_tipi,
            'manzara': oda.manzara,
            'metrekare': oda.metrekare,
            'fiyat': float(oda.ucret_gecelik),
            'durum': oda.durum
        }
