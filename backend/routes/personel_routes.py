from flask import Blueprint, request, jsonify
from database import execute_query
from models.personel import Personel
from auth.jwt_utils import token_required
from auth.password_utils import hash_password
from auth.rbac.decorators import read_required, write_required, delete_required

bp = Blueprint('personel', __name__, url_prefix='/api/personel')

@bp.route('/', methods=['GET'])
@token_required
@read_required('personel')
def get_personel(current_user):
    """Tüm personeli listele (Korumalı)"""
    try:
        query = "SELECT personel_id, kullanici_adi, ad_soyad, gorev, aktiflik FROM personel ORDER BY ad_soyad"
        results = execute_query(query, fetch=True)
        
        personel_list = []
        for row in results:
            personel = Personel.from_dict(row)
            personel_list.append(personel.to_dict())
        
        return jsonify(personel_list), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:personel_id>', methods=['GET'])
@token_required
def get_personel_by_id(personel_id, current_user):
    """ID'ye göre personel getir (Korumalı)"""
    try:
        query = "SELECT personel_id, kullanici_adi, ad_soyad, gorev, aktiflik FROM personel WHERE personel_id = %s"
        results = execute_query(query, params=(personel_id,), fetch=True)
        
        if not results:
            return jsonify({'error': 'Personel bulunamadı'}), 404
        
        personel = Personel.from_dict(results[0])
        return jsonify(personel.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
@write_required('personel')
def create_personel(current_user):
    """Yeni personel oluştur (Korumalı)"""
    try:
        data = request.get_json()
        
        if not data.get('kullanici_adi'):
            return jsonify({'error': 'Kullanıcı adı zorunludur'}), 400
        if not data.get('ad_soyad'):
            return jsonify({'error': 'Ad/Soyad zorunludur'}), 400
        if not data.get('sifre'):
            return jsonify({'error': 'Şifre zorunludur'}), 400
        
        hashed_password = hash_password(data['sifre'])
        
        insert_query = """
            INSERT INTO personel (kullanici_adi, ad_soyad, sifre, gorev, aktiflik)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(insert_query, 
                     params=(data['kullanici_adi'], data['ad_soyad'], hashed_password, 
                            data.get('gorev', 'staff'), data.get('aktiflik', True)),
                     fetch=False)
        
        id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(id_query, fetch=True)
        
        return jsonify({
            'personel_id': id_result[0]['id'],
            'kullanici_adi': data['kullanici_adi'],
            'ad_soyad': data['ad_soyad'],
            'gorev': data.get('gorev', 'staff'),
            'aktiflik': data.get('aktiflik', True)
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:personel_id>', methods=['PUT'])
@token_required
@write_required('personel')
def update_personel(personel_id, current_user):
    """Personel bilgilerini güncelle (Korumalı)"""
    try:
        data = request.get_json()
        
        check_query = "SELECT personel_id FROM personel WHERE personel_id = %s"
        existing = execute_query(check_query, params=(personel_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Personel bulunamadı'}), 404
        
        update_fields = []
        params = []
        for key in ['kullanici_adi', 'ad_soyad', 'gorev', 'aktiflik']:
            if key in data:
                update_fields.append(f"{key} = %s")
                if key == 'sifre':
                    params.append(hash_password(data[key]))
                else:
                    params.append(data[key])
        
        if 'sifre' in data and data['sifre']:
            update_fields.append("sifre = %s")
            params.append(hash_password(data['sifre']))
        
        if not update_fields:
            return jsonify({'error': 'Güncellenecek alan bulunamadı'}), 400
        
        params.append(personel_id)
        update_query = f"UPDATE personel SET {', '.join(update_fields)} WHERE personel_id = %s"
        execute_query(update_query, params=params, fetch=False)
        
        select_query = "SELECT personel_id, kullanici_adi, ad_soyad, gorev, aktiflik FROM personel WHERE personel_id = %s"
        results = execute_query(select_query, params=(personel_id,), fetch=True)
        personel = Personel.from_dict(results[0])
        
        return jsonify(personel.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:personel_id>', methods=['DELETE'])
@token_required
@delete_required('personel')
def delete_personel(personel_id, current_user):
    """Personel sil (Korumalı)"""
    try:
        check_query = "SELECT personel_id FROM personel WHERE personel_id = %s"
        existing = execute_query(check_query, params=(personel_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Personel bulunamadı'}), 404
        
        delete_query = "DELETE FROM personel WHERE personel_id = %s"
        execute_query(delete_query, params=(personel_id,), fetch=False)
        
        return jsonify({'message': 'Personel silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

