from flask import Blueprint, request, jsonify
from database import execute_query
from models.ekstra_hizmet import EkstraHizmet
from auth.jwt_utils import token_required

bp = Blueprint('hizmet', __name__, url_prefix='/api/services')

@bp.route('/', methods=['GET'])
@token_required
def get_services(current_user):
    """Tum ekstra hizmetleri listele (Korumali)"""
    try:
        query = """
        SELECT hizmet_id, hizmet_adi, birim_fiyat, kategori 
        FROM ekstra_hizmetler 
        ORDER BY hizmet_adi
        """
        result = execute_query(query, fetch=True)

        services = []
        for row in result:
            service = EkstraHizmet.from_dict(row)
            services.append(service.to_dict())

        return jsonify(services), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:service_id>', methods=['GET'])
@token_required
def get_service_by_id(service_id, current_user):
    """ID'ye gore hizmet getir (Korumali)"""
    try:
        query = """
        SELECT hizmet_id, hizmet_adi, birim_fiyat, kategori 
        FROM ekstra_hizmetler 
        WHERE hizmet_id = %s
        """
        result = execute_query(query, params=(service_id,), fetch=True)

        if not result:
            return jsonify({'error': 'Hizmet bulunamadi'}), 404

        service = EkstraHizmet.from_dict(result[0])
        return jsonify(service.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_service(current_user):
    """Yeni ekstra hizmet olustur (Korumali)"""
    try:
        data = request.get_json()

        # Validasyon
        if not data.get('hizmet_adi'):
            return jsonify({'error': 'hizmet_adi alani zorunludur'}), 400

        if not data.get('birim_fiyat') or data.get('birim_fiyat', 0) < 0:
            return jsonify({'error': 'birim_fiyat alani zorunludur ve 0\'dan kucuk olamaz'}), 400

        # Hizmet adi benzersiz mi kontrol et
        check_query = "SELECT hizmet_id FROM ekstra_hizmetler WHERE hizmet_adi = %s"
        existing = execute_query(check_query, params=(data['hizmet_adi'],), fetch=True)
        if existing:
            return jsonify({'error': 'Bu hizmet adi zaten mevcut'}), 400

        # Yeni hizmet olustur
        service = EkstraHizmet(
            hizmet_adi=data['hizmet_adi'],
            birim_fiyat=float(data['birim_fiyat']),
            kategori=data.get('kategori')
        )

        # Veritabanina ekle
        insert_query = """
        INSERT INTO ekstra_hizmetler (hizmet_adi, birim_fiyat, kategori)
        VALUES (%s, %s, %s)
        """
        execute_query(insert_query, params=(
            service.hizmet_adi, service.birim_fiyat, service.kategori
        ), fetch=False)

        # Eklenen hizmetin ID'sini al
        last_id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(last_id_query, fetch=True)
        service.hizmet_id = id_result[0]['id']

        return jsonify(service.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:service_id>', methods=['PUT'])
@token_required
def update_service(service_id, current_user):
    """Hizmet bilgilerini guncelle (Korumali)"""
    try:
        # Once hizmet var mi kontrol et
        check_query = "SELECT hizmet_id FROM ekstra_hizmetler WHERE hizmet_id = %s"
        existing = execute_query(check_query, params=(service_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Hizmet bulunamadi'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Guncellenecek veri bulunamadi'}), 400

        # Guncellenecek alanlari hazirla
        update_fields = []
        update_values = []

        if 'hizmet_adi' in data:
            # Hizmet adi benzersiz mi kontrol et (kendi ID'si haric)
            check_name_query = "SELECT hizmet_id FROM ekstra_hizmetler WHERE hizmet_adi = %s AND hizmet_id != %s"
            existing_name = execute_query(check_name_query, params=(data['hizmet_adi'], service_id), fetch=True)
            if existing_name:
                return jsonify({'error': 'Bu hizmet adi zaten mevcut'}), 400
            update_fields.append("hizmet_adi = %s")
            update_values.append(data['hizmet_adi'])

        if 'birim_fiyat' in data:
            if data['birim_fiyat'] < 0:
                return jsonify({'error': 'Fiyat 0\'dan kucuk olamaz'}), 400
            update_fields.append("birim_fiyat = %s")
            update_values.append(float(data['birim_fiyat']))

        if 'kategori' in data:
            update_fields.append("kategori = %s")
            update_values.append(data['kategori'])

        if not update_fields:
            return jsonify({'error': 'Guncellenecek alan bulunamadi'}), 400

        # Guncelleme sorgusu
        update_query = f"UPDATE ekstra_hizmetler SET {', '.join(update_fields)} WHERE hizmet_id = %s"
        update_values.append(service_id)

        execute_query(update_query, params=tuple(update_values), fetch=False)

        # Guncellenmis hizmeti getir
        select_query = """
        SELECT hizmet_id, hizmet_adi, birim_fiyat, kategori 
        FROM ekstra_hizmetler 
        WHERE hizmet_id = %s
        """
        result = execute_query(select_query, params=(service_id,), fetch=True)
        service = EkstraHizmet.from_dict(result[0])

        return jsonify(service.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:service_id>', methods=['DELETE'])
@token_required
def delete_service(service_id, current_user):
    """Hizmet sil (Korumali)"""
    try:
        # Once hizmet var mi kontrol et
        check_query = "SELECT hizmet_id FROM ekstra_hizmetler WHERE hizmet_id = %s"
        existing = execute_query(check_query, params=(service_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Hizmet bulunamadi'}), 404

        # Hizmet kullaniliyor mu kontrol et (musteri_harcamalari tablosunda)
        usage_check_query = """
        SELECT COUNT(*) as count 
        FROM musteri_harcamalari 
        WHERE hizmet_id = %s
        """
        usage_result = execute_query(usage_check_query, params=(service_id,), fetch=True)
        if usage_result and usage_result[0]['count'] > 0:
            return jsonify({
                'error': 'Bu hizmet kullanildigi icin silinemez. Once iliskili kayitlari silin.'
            }), 400

        # Silme islemi
        delete_query = "DELETE FROM ekstra_hizmetler WHERE hizmet_id = %s"
        execute_query(delete_query, params=(service_id,), fetch=False)

        return jsonify({'message': 'Hizmet silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
