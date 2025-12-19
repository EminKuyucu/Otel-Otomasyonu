from datetime import datetime
from flask import Blueprint, request, jsonify
from database import execute_query
from models.rezervasyon import Rezervasyon
from auth.jwt_utils import token_required

bp = Blueprint('reservations', __name__, url_prefix='/api/reservations')

@bp.route('/options', methods=['GET'])
@token_required
def get_reservation_options(current_user):
    """Rezervasyon durumu seçeneklerini döndür"""
    try:
        return jsonify({
            'statuses': Rezervasyon.DURUM_CHOICES
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def parse_date(value: str):
    return datetime.strptime(value, '%Y-%m-%d').date()


def oda_musait_mi(oda_id: int, giris, cikis, exclude_id=None) -> bool:
    """Odanın belirtilen tarih araliginda musaitligini kontrol eder."""
    query = """
        SELECT COUNT(*) as cnt
        FROM rezervasyonlar
        WHERE oda_id = %s
          AND rezervasyon_durumu IN ('aktif', 'bekliyor')
          AND cikis_tarihi > %s
          AND giris_tarihi < %s
    """
    params = [oda_id, giris, cikis]
    if exclude_id:
        query += " AND rezervasyon_id != %s"
        params.append(exclude_id)
    result = execute_query(query, params=tuple(params), fetch=True)
    return result[0]['cnt'] == 0


def oda_fiyat_getir(oda_id: int):
    """Odanın fiyatını ve durumunu döndürür."""
    query = "SELECT ucret_gecelik, durum FROM odalar WHERE oda_id = %s"
    result = execute_query(query, params=(oda_id,), fetch=True)
    if not result:
        return None
    return result[0]


def oda_durum_guncelle(oda_id: int, durum: str):
    """Oda durumunu gunceller."""
    update_query = "UPDATE odalar SET durum = %s WHERE oda_id = %s"
    execute_query(update_query, params=(durum, oda_id), fetch=False)


@bp.route('/', methods=['GET'])
@token_required
def get_reservations(current_user):
    """Tum rezervasyonlari listele (Korumali)"""
    try:
        query = """
        SELECT rezervasyon_id, musteri_id, oda_id, giris_tarihi, cikis_tarihi,
               yetiskin_sayisi, cocuk_sayisi, toplam_ucret, rezervasyon_durumu,
               olusturulma_tarihi
        FROM rezervasyonlar
        ORDER BY olusturulma_tarihi DESC
        """
        result = execute_query(query, fetch=True)
        reservations = [Rezervasyon.from_dict(row).to_dict() for row in result]
        return jsonify(reservations), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:rez_id>', methods=['GET'])
@token_required
def get_reservation_by_id(rez_id, current_user):
    """ID'ye gore rezervasyon getir (Korumali)"""
    try:
        query = """
        SELECT rezervasyon_id, musteri_id, oda_id, giris_tarihi, cikis_tarihi,
               yetiskin_sayisi, cocuk_sayisi, toplam_ucret, rezervasyon_durumu,
               olusturulma_tarihi
        FROM rezervasyonlar
        WHERE rezervasyon_id = %s
        """
        result = execute_query(query, params=(rez_id,), fetch=True)
        if not result:
            return jsonify({'error': 'Rezervasyon bulunamadi'}), 404
        reservation = Rezervasyon.from_dict(result[0])
        return jsonify(reservation.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/', methods=['POST'])
@token_required
def create_reservation(current_user):
    """Yeni rezervasyon olustur (Korumali)"""
    try:
        data = request.get_json()
        required = ['musteri_id', 'oda_id', 'giris_tarihi', 'cikis_tarihi']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} alanı zorunludur'}), 400

        giris = parse_date(data['giris_tarihi'])
        cikis = parse_date(data['cikis_tarihi'])
        if cikis <= giris:
            return jsonify({'error': 'Cikis tarihi giris tarihinden buyuk olmalidir'}), 400

        # Oda fiyat ve durum kontrolu
        oda_info = oda_fiyat_getir(data['oda_id'])
        if not oda_info:
            return jsonify({'error': 'Oda bulunamadi'}), 404
        if oda_info.get('durum') != 'Boş':
            return jsonify({'error': 'Oda su anda bos degil'}), 400

        # Tarih cakisma kontrolu
        if not oda_musait_mi(data['oda_id'], giris, cikis):
            return jsonify({'error': 'Bu tarih araliginda odada rezervasyon var'}), 400

        gun_sayisi = (cikis - giris).days
        toplam_ucret = float(oda_info['ucret_gecelik']) * gun_sayisi

        # Rezervasyon ekle
        insert_query = """
        INSERT INTO rezervasyonlar
        (musteri_id, oda_id, giris_tarihi, cikis_tarihi, yetiskin_sayisi, cocuk_sayisi, toplam_ucret, rezervasyon_tipi, rezervasyon_durumu, olusturulma_tarihi)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        execute_query(insert_query, params=(
            data['musteri_id'],
            data['oda_id'],
            giris,
            cikis,
            data.get('yetiskin_sayisi', 1),
            data.get('cocuk_sayisi', 0),
            toplam_ucret,
            data.get('rezervasyon_tipi', 'Online'),
            Rezervasyon.DURUM_AKTIF
        ), fetch=False)

        # Son ID
        id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(id_query, fetch=True)
        rez_id = id_result[0]['id']

        # Oda durumunu dolu yap
        oda_durum_guncelle(data['oda_id'], 'Dolu')

        reservation = Rezervasyon(
            rezervasyon_id=rez_id,
            musteri_id=data['musteri_id'],
            oda_id=data['oda_id'],
            giris_tarihi=giris,
            cikis_tarihi=cikis,
            yetiskin_sayisi=data.get('yetiskin_sayisi', 1),
            cocuk_sayisi=data.get('cocuk_sayisi', 0),
            toplam_ucret=toplam_ucret,
            rezervasyon_durumu=Rezervasyon.DURUM_AKTIF
        )

        return jsonify(reservation.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@bp.route('/<int:rez_id>', methods=['PUT'])
@token_required
def update_reservation(rez_id, current_user):
    """Rezervasyon bilgilerini guncelle (Korumali)"""
    try:
        # Mevcut rezervasyonu cek
        select_query = """
        SELECT rezervasyon_id, musteri_id, oda_id, giris_tarihi, cikis_tarihi,
               yetiskin_sayisi, cocuk_sayisi, toplam_ucret, rezervasyon_durumu,
               olusturulma_tarihi
        FROM rezervasyonlar
        WHERE rezervasyon_id = %s
        """
        existing = execute_query(select_query, params=(rez_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Rezervasyon bulunamadi'}), 404
        current = existing[0]

        data = request.get_json() or {}

        yeni_oda_id = data.get('oda_id', current['oda_id'])
        giris = parse_date(data['giris_tarihi']) if data.get('giris_tarihi') else current['giris_tarihi']
        cikis = parse_date(data['cikis_tarihi']) if data.get('cikis_tarihi') else current['cikis_tarihi']

        if cikis <= giris:
            return jsonify({'error': 'Cikis tarihi giris tarihinden buyuk olmalidir'}), 400

        # Tarih cakisma kontrolu
        if not oda_musait_mi(yeni_oda_id, giris, cikis, exclude_id=rez_id):
            return jsonify({'error': 'Bu tarih araliginda odada rezervasyon var'}), 400

        # Oda fiyatini cek ve toplam ucret hesapla (oda degisti veya tarih degisti ise)
        oda_info = oda_fiyat_getir(yeni_oda_id)
        if not oda_info:
            return jsonify({'error': 'Oda bulunamadi'}), 404
        gun_sayisi = (cikis - giris).days
        toplam_ucret = float(oda_info['fiyat']) * gun_sayisi

        rezervasyon_durumu = data.get('rezervasyon_durumu', current['rezervasyon_durumu'])
        if not Rezervasyon().validate_status(rezervasyon_durumu):
            return jsonify({'error': f'Gecersiz durum: {rezervasyon_durumu}'}), 400

        update_fields = []
        update_values = []
        field_map = {
            'musteri_id': data.get('musteri_id', current['musteri_id']),
            'oda_id': yeni_oda_id,
            'giris_tarihi': giris,
            'cikis_tarihi': cikis,
            'yetiskin_sayisi': data.get('yetiskin_sayisi', current['yetiskin_sayisi']),
            'cocuk_sayisi': data.get('cocuk_sayisi', current['cocuk_sayisi']),
            'toplam_ucret': toplam_ucret,
            'rezervasyon_durumu': rezervasyon_durumu
        }
        for key, val in field_map.items():
            update_fields.append(f"{key} = %s")
            update_values.append(val)

        update_values.append(rez_id)
        update_query = f"UPDATE rezervasyonlar SET {', '.join(update_fields)} WHERE rezervasyon_id = %s"
        execute_query(update_query, params=tuple(update_values), fetch=False)

        # Oda durumlarini guncelle
        if rezervasyon_durumu in [Rezervasyon.DURUM_IPTAL, Rezervasyon.DURUM_TAMAMLANDI]:
            oda_durum_guncelle(yeni_oda_id, 'Boş')
        else:
            oda_durum_guncelle(yeni_oda_id, 'Dolu')

        updated = Rezervasyon.from_dict({**field_map, 'rezervasyon_id': rez_id, 'olusturulma_tarihi': current.get('olusturulma_tarihi')})
        return jsonify(updated.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@bp.route('/<int:rez_id>', methods=['DELETE'])
@token_required
def delete_reservation(rez_id, current_user):
    """Rezervasyon sil (Korumali)"""
    try:
        # Mevcut rezervasyon
        select_query = """
        SELECT rezervasyon_id, musteri_id, oda_id
        FROM rezervasyonlar
        WHERE rezervasyon_id = %s
        """
        existing = execute_query(select_query, params=(rez_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Rezervasyon bulunamadi'}), 404
        current = existing[0]

        # Log kaydi
        log_query = """
        INSERT INTO silinen_rezervasyon_log (rezervasyon_id, musteri_id, silinme_tarihi, sebep)
        VALUES (%s, %s, NOW(), %s)
        """
        execute_query(log_query, params=(rez_id, current['musteri_id'], 'Kullanici tarafindan silindi'), fetch=False)

        # Rezervasyonu sil
        delete_query = "DELETE FROM rezervasyonlar WHERE rezervasyon_id = %s"
        execute_query(delete_query, params=(rez_id,), fetch=False)

        # Odayi bos yap
        oda_durum_guncelle(current['oda_id'], 'Boş')

        return jsonify({'message': 'Rezervasyon silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@bp.route('/<int:rezervasyon_id>/degerlendirme', methods=['GET'])
@token_required
def get_rezervasyon_degerlendirme(rezervasyon_id, current_user):
    """Rezervasyon degerlendirmesini getir"""
    try:
        # Rezervasyon var mı kontrol et
        check_query = "SELECT rezervasyon_id, musteri_id FROM rezervasyonlar WHERE rezervasyon_id = %s"
        existing = execute_query(check_query, params=(rezervasyon_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Rezervasyon bulunamadi'}), 404

        # Değerlendirme var mı kontrol et
        query = """
        SELECT degerlendirme_id, rezervasyon_id, puan, yorum
        FROM musteri_degerlendirme
        WHERE rezervasyon_id = %s
        """
        result = execute_query(query, params=(rezervasyon_id,), fetch=True)

        if result:
            return jsonify(result[0]), 200
        else:
            return jsonify({'message': 'Degerlendirme bulunamadi'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:rezervasyon_id>/degerlendirme', methods=['POST'])
@token_required
def create_rezervasyon_degerlendirme(rezervasyon_id, current_user):
    """Rezervasyon icin degerlendirme olustur"""
    try:
        data = request.get_json()

        # Rezervasyon var mı kontrol et
        check_query = "SELECT rezervasyon_id, musteri_id FROM rezervasyonlar WHERE rezervasyon_id = %s"
        existing = execute_query(check_query, params=(rezervasyon_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Rezervasyon bulunamadi'}), 404

        # Zaten değerlendirme var mı kontrol et
        existing_review_query = "SELECT degerlendirme_id FROM musteri_degerlendirme WHERE rezervasyon_id = %s"
        existing_review = execute_query(existing_review_query, params=(rezervasyon_id,), fetch=True)
        if existing_review:
            return jsonify({'error': 'Bu rezervasyon icin zaten degerlendirme mevcut'}), 400

        # Değerlendirme oluştur
        insert_query = """
        INSERT INTO musteri_degerlendirme (rezervasyon_id, puan, yorum)
        VALUES (%s, %s, %s)
        """
        execute_query(insert_query, params=(
            rezervasyon_id,
            data.get('puan'),
            data.get('yorum', '')
        ), fetch=False)

        return jsonify({'message': 'Degerlendirme olusturuldu'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:rezervasyon_id>/degerlendirme', methods=['PUT'])
@token_required
def update_rezervasyon_degerlendirme(rezervasyon_id, current_user):
    """Rezervasyon degerlendirmesini guncelle"""
    try:
        data = request.get_json()

        # Değerlendirme var mı kontrol et
        check_query = "SELECT degerlendirme_id FROM musteri_degerlendirme WHERE rezervasyon_id = %s"
        existing = execute_query(check_query, params=(rezervasyon_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Degerlendirme bulunamadi'}), 404

        # Değerlendirme güncelle
        update_query = """
        UPDATE musteri_degerlendirme
        SET puan = %s, yorum = %s
        WHERE rezervasyon_id = %s
        """
        execute_query(update_query, params=(
            data.get('puan'),
            data.get('yorum', ''),
            rezervasyon_id
        ), fetch=False)

        return jsonify({'message': 'Degerlendirme guncellendi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
