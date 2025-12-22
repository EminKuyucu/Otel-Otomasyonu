from flask import Blueprint, request, jsonify
from database import execute_query
from models.oda import Oda
from auth.jwt_utils import token_required
from services.oda_service import OdaService
from models.sqlalchemy_base import db_session

bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')

# Frontend'in kullandığı endpoint'ler için ikinci blueprint
bp_odalar = Blueprint('odalar', __name__, url_prefix='/api/odalar')

@bp.route('/options', methods=['GET'])
@token_required
def get_room_options(current_user):
    """Oda tipi seçeneklerini döndür"""
    try:
        return jsonify({
            'types': Oda.TIPO_CHOICES,
            'statuses': Oda.DURUM_CHOICES
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['GET'])
@token_required
def get_rooms(current_user):
    """Tüm odaları listele (Korumalı)"""
    try:
        query = "SELECT oda_id, oda_numarasi, oda_tipi, manzara, ucret_gecelik, durum FROM odalar ORDER BY oda_numarasi"
        results = execute_query(query, fetch=True)

        odalar = []
        for row in results:
            oda = Oda.from_dict(row)
            odalar.append(oda.to_dict())

        # Eğer hiç oda yoksa test verileri ekle
        if len(odalar) == 0:
            print("Veritabanında oda bulunamadı, test verileri ekleniyor...")
            add_test_rooms()
            # Tekrar odaları getir
            results = execute_query(query, fetch=True)
            odalar = []
            for row in results:
                oda = Oda.from_dict(row)
                odalar.append(oda.to_dict())

        return jsonify(odalar), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def add_test_rooms():
    """Test odalarını veritabanına ekler"""
    test_rooms = [
        (101, 'Tek', 'Deniz', 150.00, 'Boş'),
        (102, 'Çift', 'Panoramik Deniz', 250.00, 'Dolu'),
        (103, 'Suit', 'Bahçe', 400.00, 'Rezerve'),
        (104, 'VIP', 'Havuz', 600.00, 'Boş'),
        (105, 'Tek', 'Şehir', 120.00, 'Temizlikte'),
        (106, 'Çift', 'Orman', 180.00, 'Boş'),
        (201, 'Tek', 'Yok', 100.00, 'Tadilat'),
        (202, 'Suit', 'Deniz', 450.00, 'Boş'),
        (203, 'Çift', 'Bahçe', 220.00, 'Dolu'),
        (204, 'VIP', 'Panoramik Deniz', 750.00, 'Rezerve')
    ]

    for room_no, tip, manzara, fiyat, durum in test_rooms:
        try:
            execute_query('''
                INSERT INTO odalar (oda_numarasi, oda_tipi, manzara, ucret_gecelik, durum)
                VALUES (%s, %s, %s, %s, %s)
            ''', (room_no, tip, manzara, fiyat, durum))
            print(f"Oda {room_no} eklendi")
        except Exception as e:
            print(f"Oda {room_no} eklenirken hata: {e}")

@bp.route('/available', methods=['GET'])
@token_required
def get_available_rooms(current_user):
    """Sadece boş odaları listele (Korumalı)"""
    try:
        query = "SELECT oda_id, oda_numarasi, oda_tipi, manzara, ucret_gecelik, durum FROM odalar WHERE durum = %s ORDER BY oda_numarasi"
        results = execute_query(query, params=(Oda.DURUM_BOS,), fetch=True)

        odalar = []
        for row in results:
            oda = Oda.from_dict(row)
            odalar.append(oda.to_dict())

        return jsonify(odalar), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:room_id>', methods=['GET'])
@token_required
def get_room_by_id(room_id, current_user):
    """ID'ye göre oda getir (Korumalı)"""
    try:
        query = "SELECT oda_id, oda_numarasi, oda_tipi, manzara, ucret_gecelik, durum FROM odalar WHERE oda_id = %s"
        results = execute_query(query, params=(room_id,), fetch=True)

        if not results:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        oda = Oda.from_dict(results[0])
        return jsonify(oda.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_room(current_user):
    """Yeni oda oluştur (Korumalı)"""
    try:
        data = request.get_json()

        # Validasyon
        if not data.get('oda_no'):
            return jsonify({'error': 'Oda numarası zorunludur'}), 400

        if not data.get('tip'):
            return jsonify({'error': 'Oda tipi zorunludur'}), 400

        if not Oda().validate_type(data.get('tip')):
            return jsonify({'error': f'Geçersiz oda tipi. Geçerli tipler: {', '.join(Oda.TIPO_CHOICES)}'}), 400

        try:
            fiyat = float(data.get('fiyat', 0))
            if fiyat < 0:
                return jsonify({'error': 'Fiyat 0\'dan küçük olamaz'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Fiyat geçerli bir sayı olmalıdır'}), 400

        # Durum kontrolü
        durum = data.get('durum', Oda.DURUM_BOS)
        if durum and not Oda().validate_status(durum):
            return jsonify({'error': f'Geçersiz durum: "{durum}". Geçerli durumlar: {", ".join(Oda.DURUM_CHOICES)}'}), 400

        # Oda numarası benzersiz mi kontrol et
        check_query = "SELECT oda_id FROM odalar WHERE oda_numarasi = %s"
        existing = execute_query(check_query, params=(data.get('oda_no'),), fetch=True)
        if existing:
            return jsonify({'error': 'Bu oda numarası zaten kullanılıyor'}), 400

        # Yeni oda oluştur
        oda = Oda.from_dict(data)
        insert_query = """
            INSERT INTO odalar (oda_numarasi, oda_tipi, ucret_gecelik, durum, manzara)
            VALUES (%s, %s, %s, %s, %s)
        """
        result = execute_query(insert_query,
                              params=(oda.oda_numarasi, oda.oda_tipi, oda.ucret_gecelik, oda.durum, oda.manzara),
                              fetch=False)

        # Son eklenen ID'yi al
        id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(id_query, fetch=True)
        oda.oda_id = id_result[0]['id']

        return jsonify(oda.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:room_id>', methods=['PUT'])
@token_required
def update_room(room_id, current_user):
    """Oda bilgilerini güncelle (Korumalı)"""
    try:
        data = request.get_json()

        # Oda var mı kontrol et
        check_query = "SELECT oda_id FROM odalar WHERE oda_id = %s"
        existing = execute_query(check_query, params=(room_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Validasyon
        if 'fiyat' in data:
            try:
                fiyat = float(data['fiyat'])
                if fiyat < 0:
                    return jsonify({'error': 'Fiyat 0\'dan küçük olamaz'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': 'Fiyat geçerli bir sayı olmalıdır'}), 400

        if 'tip' in data and not Oda().validate_type(data['tip']):
            return jsonify({'error': f'Geçersiz oda tipi. Geçerli tipler: {', '.join(Oda.TIPO_CHOICES)}'}), 400

        if 'durum' in data and not Oda().validate_status(data['durum']):
            return jsonify({'error': f'Geçersiz durum. Geçerli durumlar: {", ".join(Oda.DURUM_CHOICES)}'}), 400

        # Oda numarası benzersiz mi kontrol et (değiştiriliyorsa)
        if 'oda_no' in data:
            check_no_query = "SELECT oda_id FROM odalar WHERE oda_numarasi = %s AND oda_id != %s"
            existing_no = execute_query(check_no_query, params=(data['oda_no'], room_id), fetch=True)
            if existing_no:
                return jsonify({'error': 'Bu oda numarası zaten kullanılıyor'}), 400

        # Güncelleme query'si oluştur
        update_fields = []
        params = []
        field_mapping = {'oda_no': 'oda_numarasi', 'tip': 'oda_tipi', 'fiyat': 'ucret_gecelik', 'durum': 'durum', 'manzara': 'manzara', 'metrekare': 'metrekare'}
        
        for key, value in data.items():
            if key in field_mapping:
                db_field = field_mapping[key]
                update_fields.append(f"{db_field} = %s")
                params.append(value)

        if not update_fields:
            return jsonify({'error': 'Güncellenecek alan bulunamadı'}), 400

        params.append(room_id)
        update_query = f"UPDATE odalar SET {', '.join(update_fields)} WHERE oda_id = %s"

        execute_query(update_query, params=params, fetch=False)

        # Güncellenmiş odayı getir
        select_query = "SELECT oda_id, oda_numarasi, oda_tipi, manzara, metrekare, ucret_gecelik, durum FROM odalar WHERE oda_id = %s"
        results = execute_query(select_query, params=(room_id,), fetch=True)
        oda = Oda.from_dict(results[0])

        return jsonify(oda.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:room_id>/status', methods=['PUT'])
@token_required
def update_room_status(room_id, current_user):
    """Odanın durumunu güncelle (Korumalı)"""
    try:
        data = request.get_json()

        if not data or 'durum' not in data:
            return jsonify({'error': 'Durum alanı zorunludur'}), 400

        yeni_durum = data['durum']

        # Durum kontrolü
        if yeni_durum and not Oda().validate_status(yeni_durum):
            return jsonify({'error': f'Geçersiz durum: "{yeni_durum}". Geçerli durumlar: {", ".join(Oda.DURUM_CHOICES)}'}), 400

        # Oda var mı kontrol et
        check_query = "SELECT oda_id FROM odalar WHERE oda_id = %s"
        existing = execute_query(check_query, params=(room_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Durumu güncelle
        update_query = "UPDATE odalar SET durum = %s WHERE oda_id = %s"
        execute_query(update_query, params=(yeni_durum, room_id), fetch=False)

        # Güncellenmiş odayı getir
        select_query = "SELECT oda_id, oda_numarasi, oda_tipi, manzara, metrekare, ucret_gecelik, durum FROM odalar WHERE oda_id = %s"
        results = execute_query(select_query, params=(room_id,), fetch=True)
        oda = Oda.from_dict(results[0])

        return jsonify({
            'message': 'Oda durumu güncellendi',
            'oda': oda.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:room_id>', methods=['DELETE'])
@token_required
def delete_room(room_id, current_user):
    """Oda sil (Korumalı)"""
    try:
        # Oda var mı kontrol et
        check_query = "SELECT oda_id FROM odalar WHERE oda_id = %s"
        existing = execute_query(check_query, params=(room_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Odada aktif rezervasyon var mı kontrol et (basit kontrol)
        rez_check_query = "SELECT COUNT(*) as count FROM rezervasyonlar WHERE oda_id = %s AND durum = 'aktif'"
        rez_result = execute_query(rez_check_query, params=(room_id,), fetch=True)
        if rez_result[0]['count'] > 0:
            return jsonify({'error': 'Bu odada aktif rezervasyon bulunduğu için silinemez'}), 400

        # Odayı sil
        delete_query = "DELETE FROM odalar WHERE oda_id = %s"
        execute_query(delete_query, params=(room_id,), fetch=False)

        return jsonify({'message': 'Oda başarıyla silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp_odalar.route('/', methods=['GET'])
@token_required
def get_odalar(current_user):
    """Filtre parametreleri ile odaları getir (Frontend uyumluluğu için)"""
    try:
        # Query parametreleri
        durum = request.args.get('durum')
        oda_tipi = request.args.get('oda_tipi')
        min_fiyat_str = request.args.get('minFiyat')
        max_fiyat_str = request.args.get('maxFiyat')
        arama = request.args.get('arama')

        # Fiyat dönüşümleri
        min_fiyat = None
        max_fiyat = None

        try:
            if min_fiyat_str:
                min_fiyat = float(min_fiyat_str)
            if max_fiyat_str:
                max_fiyat = float(max_fiyat_str)
        except ValueError:
            return jsonify({'error': 'Fiyat parametreleri geçerli sayı olmalıdır'}), 400

        db = db_session()

        try:
            odalar = OdaService.get_filtered_odalar(
                db=db,
                durum=durum,
                oda_tipi=oda_tipi,
                min_fiyat=min_fiyat,
                max_fiyat=max_fiyat,
                arama=arama
            )

            # SADECE filtre yoksa ve oda yoksa test verisi ekle
            if len(odalar) == 0 and not any([durum, oda_tipi, min_fiyat, max_fiyat, arama]):
                print("Veritabanında oda bulunamadı, test verileri ekleniyor...")
                add_test_rooms()

                # Test verisi sonrası tekrar çek
                odalar = OdaService.get_filtered_odalar(
                    db=db,
                    durum=durum,
                    oda_tipi=oda_tipi,
                    min_fiyat=min_fiyat,
                    max_fiyat=max_fiyat,
                    arama=arama
                )

            return jsonify(odalar), 200

        finally:
            db.close()

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp_odalar.route('/<int:oda_id>', methods=['GET'])
@token_required
def get_oda_by_id(oda_id, current_user):
    """Tek bir oda detayını getir"""
    try:
        query = "SELECT oda_id, oda_numarasi as oda_no, oda_tipi as tip, manzara, metrekare, ucret_gecelik as fiyat, durum FROM odalar WHERE oda_id = %s"
        results = execute_query(query, params=(oda_id,), fetch=True)

        if not results:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        oda = results[0]
        return jsonify({
            'oda_id': oda['oda_id'],
            'oda_numarasi': oda['oda_no'],
            'oda_tipi': oda['tip'],
            'manzara': oda['manzara'],
            'metrekare': oda.get('metrekare'),
            'ucret_gecelik': float(oda['fiyat']),
            'durum': oda['durum'],
            # Frontend uyumluluğu için alias'lar
            'oda_no': oda['oda_no'],
            'tip': oda['tip'],
            'fiyat': float(oda['fiyat'])
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_odalar.route('/', methods=['POST'])
@token_required
def create_oda(current_user):
    """Yeni oda oluştur"""
    try:
        data = request.get_json()

        # Gerekli alanları kontrol et
        required_fields = ['oda_no', 'tip', 'fiyat', 'durum']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} alanı zorunludur'}), 400

        # Veritabanına ekle
        query = """
        INSERT INTO odalar (oda_numarasi, oda_tipi, manzara, metrekare, ucret_gecelik, durum)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        execute_query(query, params=(
            data['oda_no'],
            data['tip'],
            data.get('manzara', 'Yok'),
            data.get('metrekare', None),
            float(data['fiyat']),
            data['durum']
        ), fetch=False)

        return jsonify({'message': 'Oda başarıyla oluşturuldu'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp_odalar.route('/<int:oda_id>', methods=['PUT'])
@token_required
def update_oda(oda_id, current_user):
    """Oda güncelle"""
    try:
        data = request.get_json()

        # Oda var mı kontrol et
        check_query = "SELECT oda_id FROM odalar WHERE oda_id = %s"
        existing = execute_query(check_query, params=(oda_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Güncelle
        query = """
            UPDATE odalar
            SET oda_numarasi = %s, oda_tipi = %s, manzara = %s, ucret_gecelik = %s, durum = %s
            WHERE oda_id = %s
        """
        execute_query(query, params=(
            data['oda_no'],
            data['tip'],
            data.get('manzara', 'Yok'),
            float(data['fiyat']),
            data['durum'],
            oda_id
        ), fetch=False)

        return jsonify({'message': 'Oda başarıyla güncellendi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp_odalar.route('/<int:oda_id>/ozellikler', methods=['GET'])
@token_required
def get_oda_ozellikler(oda_id, current_user):
    """Bir odanın özelliklerini getir"""
    try:
        query = """
        SELECT o.ozellik_adi
        FROM oda_ozellikleri o
        JOIN oda_ozellik_baglanti ob ON o.ozellik_id = ob.ozellik_id
        WHERE ob.oda_id = %s
        ORDER BY o.ozellik_adi
        """
        results = execute_query(query, params=(oda_id,), fetch=True)

        ozellikler = [row['ozellik_adi'] for row in results]
        return jsonify({'ozellikler': ozellikler}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp_odalar.route('/<int:oda_id>/resimler', methods=['GET'])
@token_required
def get_oda_resimleri(oda_id, current_user):
    """Bir odanın resimlerini getir"""
    try:
        # Oda var mı kontrol et
        check_query = "SELECT oda_id FROM odalar WHERE oda_id = %s"
        existing = execute_query(check_query, params=(oda_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadi'}), 404

        # Oda resimlerini getir
        query = """
        SELECT resim_id, oda_id, resim_url, resim_adi, sira, yuklenme_tarihi
        FROM oda_resimleri
        WHERE oda_id = %s
        ORDER BY sira ASC, yuklenme_tarihi DESC
        """
        results = execute_query(query, params=(oda_id,), fetch=True)

        resimler = []
        for row in results:
            resimler.append({
                'resim_id': row['resim_id'],
                'oda_id': row['oda_id'],
                'resim_url': row['resim_url'],
                'resim_adi': row['resim_adi'],
                'sira': row['sira'],
                'yuklenme_tarihi': row['yuklenme_tarihi'].isoformat() if row['yuklenme_tarihi'] else None
            })

        return jsonify(resimler), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

