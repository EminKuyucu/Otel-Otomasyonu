from flask import Blueprint, request, jsonify
from database import execute_query
from models.depo_stok import DepoStok
from auth.jwt_utils import token_required

bp = Blueprint('stok', __name__, url_prefix='/api/stock')

@bp.route('/', methods=['GET'])
@token_required
def get_stock(current_user):
    """Tum stoklari listele (Korumali)"""
    try:
        query = """
        SELECT urun_id, hizmet_id, urun_adi, stok_adedi, son_guncelleme 
        FROM depo_stok 
        ORDER BY urun_adi
        """
        result = execute_query(query, fetch=True)

        stock_items = []
        for row in result:
            stock = DepoStok.from_dict(row)
            stock_items.append(stock.to_dict())

        return jsonify(stock_items), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:stock_id>', methods=['GET'])
@token_required
def get_stock_by_id(stock_id, current_user):
    """ID'ye gore stok getir (Korumali)"""
    try:
        query = """
        SELECT urun_id, hizmet_id, urun_adi, stok_adedi, son_guncelleme 
        FROM depo_stok 
        WHERE urun_id = %s
        """
        result = execute_query(query, params=(stock_id,), fetch=True)

        if not result:
            return jsonify({'error': 'Stok bulunamadi'}), 404

        stock = DepoStok.from_dict(result[0])
        return jsonify(stock.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_stock(current_user):
    """Yeni stok olustur (Korumali)"""
    try:
        data = request.get_json()

        # Validasyon
        if not data.get('urun_adi'):
            return jsonify({'error': 'urun_adi alani zorunludur'}), 400

        if data.get('stok_adedi', 0) < 0:
            return jsonify({'error': 'Stok adedi 0\'dan kucuk olamaz'}), 400

        # Hizmet var mi kontrol et (varsa)
        if data.get('hizmet_id'):
            check_hizmet_query = "SELECT hizmet_id FROM ekstra_hizmetler WHERE hizmet_id = %s"
            existing_hizmet = execute_query(check_hizmet_query, params=(data['hizmet_id'],), fetch=True)
            if not existing_hizmet:
                return jsonify({'error': 'Gecersiz hizmet_id'}), 400

        # Yeni stok olustur
        stock = DepoStok(
            hizmet_id=data.get('hizmet_id'),
            urun_adi=data['urun_adi'],
            stok_adedi=data.get('stok_adedi', 0)
        )

        # Veritabanina ekle
        insert_query = """
        INSERT INTO depo_stok (hizmet_id, urun_adi, stok_adedi, son_guncelleme)
        VALUES (%s, %s, %s, NOW())
        """
        execute_query(insert_query, params=(
            stock.hizmet_id, stock.urun_adi, stock.stok_adedi
        ), fetch=False)

        # Eklenen stokun ID'sini al
        last_id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(last_id_query, fetch=True)
        stock.urun_id = id_result[0]['id']

        return jsonify(stock.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:stock_id>', methods=['PUT'])
@token_required
def update_stock(stock_id, current_user):
    """Stok bilgilerini guncelle (Korumali)"""
    try:
        # Once stok var mi kontrol et
        check_query = "SELECT urun_id FROM depo_stok WHERE urun_id = %s"
        existing = execute_query(check_query, params=(stock_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Stok bulunamadi'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Guncellenecek veri bulunamadi'}), 400

        # Guncellenecek alanlari hazirla
        update_fields = []
        update_values = []

        if 'urun_adi' in data:
            update_fields.append("urun_adi = %s")
            update_values.append(data['urun_adi'])

        if 'hizmet_id' in data:
            # Hizmet var mi kontrol et
            if data['hizmet_id']:
                check_hizmet_query = "SELECT hizmet_id FROM ekstra_hizmetler WHERE hizmet_id = %s"
                existing_hizmet = execute_query(check_hizmet_query, params=(data['hizmet_id'],), fetch=True)
                if not existing_hizmet:
                    return jsonify({'error': 'Gecersiz hizmet_id'}), 400
            update_fields.append("hizmet_id = %s")
            update_values.append(data['hizmet_id'])

        if 'stok_adedi' in data:
            if data['stok_adedi'] < 0:
                return jsonify({'error': 'Stok adedi 0\'dan kucuk olamaz'}), 400
            update_fields.append("stok_adedi = %s")
            update_values.append(data['stok_adedi'])

        if not update_fields:
            return jsonify({'error': 'Guncellenecek alan bulunamadi'}), 400

        # Guncelleme sorgusu
        update_fields.append("son_guncelleme = NOW()")
        update_query = f"UPDATE depo_stok SET {', '.join(update_fields)} WHERE urun_id = %s"
        update_values.append(stock_id)

        execute_query(update_query, params=tuple(update_values), fetch=False)

        # Guncellenmis stoku getir
        select_query = """
        SELECT urun_id, hizmet_id, urun_adi, stok_adedi, son_guncelleme 
        FROM depo_stok 
        WHERE urun_id = %s
        """
        result = execute_query(select_query, params=(stock_id,), fetch=True)
        stock = DepoStok.from_dict(result[0])

        return jsonify(stock.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:stock_id>', methods=['DELETE'])
@token_required
def delete_stock(stock_id, current_user):
    """Stok sil (Korumali)"""
    try:
        # Once stok var mi kontrol et
        check_query = "SELECT urun_id FROM depo_stok WHERE urun_id = %s"
        existing = execute_query(check_query, params=(stock_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Stok bulunamadi'}), 404

        # Silme islemi
        delete_query = "DELETE FROM depo_stok WHERE urun_id = %s"
        execute_query(delete_query, params=(stock_id,), fetch=False)

        return jsonify({'message': 'Stok silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/increase', methods=['POST'])
@token_required
def increase_stock(current_user):
    """Stok artir (Korumali)"""
    try:
        data = request.get_json()

        if not data.get('urun_id'):
            return jsonify({'error': 'urun_id alani zorunludur'}), 400

        if not data.get('miktar') or data.get('miktar', 0) <= 0:
            return jsonify({'error': 'miktar alani zorunludur ve 0\'dan buyuk olmalidir'}), 400

        urun_id = data['urun_id']
        miktar = int(data['miktar'])

        # Stok var mi kontrol et
        check_query = "SELECT urun_id, stok_adedi FROM depo_stok WHERE urun_id = %s"
        existing = execute_query(check_query, params=(urun_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Stok bulunamadi'}), 404

        # Stok artir
        update_query = """
        UPDATE depo_stok 
        SET stok_adedi = stok_adedi + %s, son_guncelleme = NOW() 
        WHERE urun_id = %s
        """
        execute_query(update_query, params=(miktar, urun_id), fetch=False)

        # Guncellenmis stoku getir
        select_query = """
        SELECT urun_id, hizmet_id, urun_adi, stok_adedi, son_guncelleme 
        FROM depo_stok 
        WHERE urun_id = %s
        """
        result = execute_query(select_query, params=(urun_id,), fetch=True)
        stock = DepoStok.from_dict(result[0])

        return jsonify({
            'message': f'Stok {miktar} adet artirildi',
            'stok': stock.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/decrease', methods=['POST'])
@token_required
def decrease_stock(current_user):
    """Stok azalt (Korumali) - 0'in altina dusmemeli"""
    try:
        data = request.get_json()

        if not data.get('urun_id'):
            return jsonify({'error': 'urun_id alani zorunludur'}), 400

        if not data.get('miktar') or data.get('miktar', 0) <= 0:
            return jsonify({'error': 'miktar alani zorunludur ve 0\'dan buyuk olmalidir'}), 400

        urun_id = data['urun_id']
        miktar = int(data['miktar'])

        # Stok var mi ve yeterli mi kontrol et
        check_query = "SELECT urun_id, stok_adedi FROM depo_stok WHERE urun_id = %s"
        existing = execute_query(check_query, params=(urun_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Stok bulunamadi'}), 404

        mevcut_stok = existing[0]['stok_adedi']
        if mevcut_stok < miktar:
            return jsonify({
                'error': f'Yetersiz stok. Mevcut stok: {mevcut_stok}, Istenen: {miktar}'
            }), 400

        # Stok azalt
        update_query = """
        UPDATE depo_stok 
        SET stok_adedi = stok_adedi - %s, son_guncelleme = NOW() 
        WHERE urun_id = %s
        """
        execute_query(update_query, params=(miktar, urun_id), fetch=False)

        # Guncellenmis stoku getir
        select_query = """
        SELECT urun_id, hizmet_id, urun_adi, stok_adedi, son_guncelleme 
        FROM depo_stok 
        WHERE urun_id = %s
        """
        result = execute_query(select_query, params=(urun_id,), fetch=True)
        stock = DepoStok.from_dict(result[0])

        # Stok 0'in altina dustu mu kontrol et (double check)
        if stock.stok_adedi < 0:
            # Geri al
            rollback_query = """
            UPDATE depo_stok 
            SET stok_adedi = stok_adedi + %s, son_guncelleme = NOW() 
            WHERE urun_id = %s
            """
            execute_query(rollback_query, params=(miktar, urun_id), fetch=False)
            return jsonify({'error': 'Stok 0\'in altina dusemez'}), 400

        return jsonify({
            'message': f'Stok {miktar} adet azaltildi',
            'stok': stock.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

