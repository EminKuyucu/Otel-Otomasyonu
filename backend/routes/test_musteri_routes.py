from flask import Blueprint, request, jsonify

bp = Blueprint('test_musteri', __name__, url_prefix='/api')

# Test amaçlı dummy data
CUSTOMERS = [
    {
        "musteri_id": 1,
        "ad": "Ahmet",
        "soyad": "Yılmaz",
        "tc_kimlik_no": "12345678901",
        "telefon": "555-0123",
        "email": "ahmet@example.com",
        "adres": "İstanbul"
    },
    {
        "musteri_id": 2,
        "ad": "Ayşe",
        "soyad": "Kara",
        "tc_kimlik_no": "12345678902",
        "telefon": "555-0124",
        "email": "ayse@example.com",
        "adres": "Ankara"
    }
]

def check_auth():
    """Test amaçlı basit auth kontrolü"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    token = auth_header.split(' ')[1]
    return token == "test-token-123"

@bp.route('/musteriler', methods=['GET'])
def get_musteriler():
    """Tüm müşterileri listele"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    return jsonify(CUSTOMERS), 200

@bp.route('/musteriler', methods=['POST'])
def create_musteri():
    """Yeni müşteri oluştur"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        # Basit validasyon
        required_fields = ['ad', 'soyad', 'tc_kimlik_no', 'telefon']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} alanı zorunludur'}), 400

        # TC kimlik no kontrolü (benzersiz olmalı)
        if any(c['tc_kimlik_no'] == data['tc_kimlik_no'] for c in CUSTOMERS):
            return jsonify({'message': 'Bu TC kimlik numarası zaten kayıtlı'}), 400

        # Yeni müşteri ID'si
        new_id = max([c['musteri_id'] for c in CUSTOMERS]) + 1 if CUSTOMERS else 1

        new_customer = {
            'musteri_id': new_id,
            'ad': data['ad'],
            'soyad': data['soyad'],
            'tc_kimlik_no': data['tc_kimlik_no'],
            'telefon': data['telefon'],
            'email': data.get('email', ''),
            'adres': data.get('adres', '')
        }

        CUSTOMERS.append(new_customer)
        return jsonify(new_customer), 201

    except Exception as e:
        return jsonify({'message': 'Müşteri oluşturulamadı'}), 500

@bp.route('/musteriler/<int:musteri_id>', methods=['PUT'])
def update_musteri(musteri_id):
    """Müşteri güncelle"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        # Müşteri bul
        customer = next((c for c in CUSTOMERS if c['musteri_id'] == musteri_id), None)
        if not customer:
            return jsonify({'message': 'Müşteri bulunamadı'}), 404

        # TC kimlik no benzersizlik kontrolü (kendisi hariç)
        if 'tc_kimlik_no' in data:
            if any(c['tc_kimlik_no'] == data['tc_kimlik_no'] and c['musteri_id'] != musteri_id for c in CUSTOMERS):
                return jsonify({'message': 'Bu TC kimlik numarası zaten kayıtlı'}), 400

        # Güncelleme
        if 'ad' in data:
            customer['ad'] = data['ad']
        if 'soyad' in data:
            customer['soyad'] = data['soyad']
        if 'tc_kimlik_no' in data:
            customer['tc_kimlik_no'] = data['tc_kimlik_no']
        if 'telefon' in data:
            customer['telefon'] = data['telefon']
        if 'email' in data:
            customer['email'] = data['email']
        if 'adres' in data:
            customer['adres'] = data['adres']

        return jsonify(customer), 200

    except Exception as e:
        return jsonify({'message': 'Müşteri güncellenemedi'}), 500

@bp.route('/musteriler/<int:musteri_id>', methods=['DELETE'])
def delete_musteri(musteri_id):
    """Müşteri sil"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        # Müşteri bul ve sil
        global CUSTOMERS
        customer = next((c for c in CUSTOMERS if c['musteri_id'] == musteri_id), None)
        if not customer:
            return jsonify({'message': 'Müşteri bulunamadı'}), 404

        CUSTOMERS = [c for c in CUSTOMERS if c['musteri_id'] != musteri_id]
        return jsonify({'message': 'Müşteri silindi'}), 200

    except Exception as e:
        return jsonify({'message': 'Müşteri silinemedi'}), 500
