from flask import Blueprint, request, jsonify
from database import execute_query
from models.oda import Oda
from auth.jwt_utils import token_required

bp = Blueprint('rooms', __name__, url_prefix='/api/rooms')

@bp.route('/', methods=['GET'])
@token_required
def get_rooms(current_user):
    """Tüm odaları listele (Korumalı)"""
    try:
        query = "SELECT oda_id, oda_no, tip, fiyat, durum, olusturulma_tarihi FROM oda ORDER BY oda_no"
        results = execute_query(query, fetch=True)

        odalar = []
        for row in results:
            oda = Oda.from_dict(row)
            odalar.append(oda.to_dict())

        return jsonify(odalar), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/available', methods=['GET'])
@token_required
def get_available_rooms(current_user):
    """Sadece boş odaları listele (Korumalı)"""
    try:
        query = "SELECT oda_id, oda_no, tip, fiyat, durum, olusturulma_tarihi FROM oda WHERE durum = %s ORDER BY oda_no"
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
        query = "SELECT oda_id, oda_no, tip, fiyat, durum, olusturulma_tarihi FROM oda WHERE oda_id = %s"
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

        if data.get('fiyat', 0) < 0:
            return jsonify({'error': 'Fiyat 0\'dan küçük olamaz'}), 400

        # Durum kontrolü
        durum = data.get('durum', Oda.DURUM_BOS)
        if not Oda().validate_status(durum):
            return jsonify({'error': f'Geçersiz durum. Geçerli durumlar: {", ".join(Oda.DURUM_CHOICES)}'}), 400

        # Oda numarası benzersiz mi kontrol et
        check_query = "SELECT oda_id FROM oda WHERE oda_no = %s"
        existing = execute_query(check_query, params=(data['oda_no'],), fetch=True)
        if existing:
            return jsonify({'error': 'Bu oda numarası zaten kullanılıyor'}), 400

        # Yeni oda oluştur
        oda = Oda.from_dict(data)
        insert_query = """
            INSERT INTO oda (oda_no, tip, fiyat, durum)
            VALUES (%s, %s, %s, %s)
        """
        result = execute_query(insert_query,
                              params=(oda.oda_no, oda.tip, oda.fiyat, oda.durum),
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
        check_query = "SELECT oda_id FROM oda WHERE oda_id = %s"
        existing = execute_query(check_query, params=(room_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Validasyon
        if 'fiyat' in data and data['fiyat'] < 0:
            return jsonify({'error': 'Fiyat 0\'dan küçük olamaz'}), 400

        if 'durum' in data and not Oda().validate_status(data['durum']):
            return jsonify({'error': f'Geçersiz durum. Geçerli durumlar: {", ".join(Oda.DURUM_CHOICES)}'}), 400

        # Oda numarası benzersiz mi kontrol et (değiştiriliyorsa)
        if 'oda_no' in data:
            check_no_query = "SELECT oda_id FROM oda WHERE oda_no = %s AND oda_id != %s"
            existing_no = execute_query(check_no_query, params=(data['oda_no'], room_id), fetch=True)
            if existing_no:
                return jsonify({'error': 'Bu oda numarası zaten kullanılıyor'}), 400

        # Güncelleme query'si oluştur
        update_fields = []
        params = []
        for key, value in data.items():
            if key in ['oda_no', 'tip', 'fiyat', 'durum']:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields:
            return jsonify({'error': 'Güncellenecek alan bulunamadı'}), 400

        params.append(room_id)
        update_query = f"UPDATE oda SET {', '.join(update_fields)} WHERE oda_id = %s"

        execute_query(update_query, params=params, fetch=False)

        # Güncellenmiş odayı getir
        select_query = "SELECT oda_id, oda_no, tip, fiyat, durum, olusturulma_tarihi FROM oda WHERE oda_id = %s"
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
        if not Oda().validate_status(yeni_durum):
            return jsonify({'error': f'Geçersiz durum. Geçerli durumlar: {", ".join(Oda.DURUM_CHOICES)}'}), 400

        # Oda var mı kontrol et
        check_query = "SELECT oda_id FROM oda WHERE oda_id = %s"
        existing = execute_query(check_query, params=(room_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Durumu güncelle
        update_query = "UPDATE oda SET durum = %s WHERE oda_id = %s"
        execute_query(update_query, params=(yeni_durum, room_id), fetch=False)

        # Güncellenmiş odayı getir
        select_query = "SELECT oda_id, oda_no, tip, fiyat, durum, olusturulma_tarihi FROM oda WHERE oda_id = %s"
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
        check_query = "SELECT oda_id FROM oda WHERE oda_id = %s"
        existing = execute_query(check_query, params=(room_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Oda bulunamadı'}), 404

        # Odada aktif rezervasyon var mı kontrol et (basit kontrol)
        rez_check_query = "SELECT COUNT(*) as count FROM rezervasyon WHERE oda_id = %s AND durum = 'aktif'"
        rez_result = execute_query(rez_check_query, params=(room_id,), fetch=True)
        if rez_result[0]['count'] > 0:
            return jsonify({'error': 'Bu odada aktif rezervasyon bulunduğu için silinemez'}), 400

        # Odayı sil
        delete_query = "DELETE FROM oda WHERE oda_id = %s"
        execute_query(delete_query, params=(room_id,), fetch=False)

        return jsonify({'message': 'Oda başarıyla silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
