from flask import Blueprint, request, jsonify
from database import db
from models import Personel
from auth.jwt_utils import token_required
from auth.password_utils import hash_password

bp = Blueprint('personel', __name__, url_prefix='/api/personel')

@bp.route('/', methods=['GET'])
@token_required
def get_personel(current_user):
    """Tüm personeli listele (Korumalı)"""
    try:
        personel_list = Personel.query.all()
        return jsonify([p.to_dict() for p in personel_list]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:personel_id>', methods=['GET'])
@token_required
def get_personel_by_id(personel_id, current_user):
    """ID'ye göre personel getir (Korumalı)"""
    try:
        personel = Personel.query.get_or_404(personel_id)
        return jsonify(personel.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_personel(current_user):
    """Yeni personel oluştur (Korumalı)"""
    try:
        data = request.get_json()
        
        # Şifreyi hashle
        if 'sifre' in data:
            data['sifre'] = hash_password(data['sifre'])
        
        personel = Personel(**data)
        db.session.add(personel)
        db.session.commit()
        return jsonify(personel.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:personel_id>', methods=['PUT'])
@token_required
def update_personel(personel_id, current_user):
    """Personel bilgilerini güncelle (Korumalı)"""
    try:
        personel = Personel.query.get_or_404(personel_id)
        data = request.get_json()
        
        # Şifre güncelleniyorsa hashle
        if 'sifre' in data and data['sifre']:
            data['sifre'] = hash_password(data['sifre'])
        
        for key, value in data.items():
            setattr(personel, key, value)
        db.session.commit()
        return jsonify(personel.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:personel_id>', methods=['DELETE'])
@token_required
def delete_personel(personel_id, current_user):
    """Personel sil (Korumalı)"""
    try:
        personel = Personel.query.get_or_404(personel_id)
        db.session.delete(personel)
        db.session.commit()
        return jsonify({'message': 'Personel silindi'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

