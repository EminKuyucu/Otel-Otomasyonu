from flask import Blueprint, request, jsonify

bp = Blueprint('test_oda', __name__, url_prefix='/api')

# Test amaçlı dummy data
ROOMS = [
    {
        "oda_id": 1,
        "oda_no": "101",
        "tip": "Standart",
        "fiyat": 150.00,
        "kapasite": 2,
        "aktif": True
    },
    {
        "oda_id": 2,
        "oda_no": "102",
        "tip": "Deluxe",
        "fiyat": 250.00,
        "kapasite": 3,
        "aktif": True
    }
]

def check_auth():
    """Test amaçlı basit auth kontrolü"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    token = auth_header.split(' ')[1]
    return token == "test-token-123"

@bp.route('/odalar', methods=['GET'])
def get_odalar():
    """Tüm odaları listele"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    return jsonify(ROOMS), 200

@bp.route('/odalar', methods=['POST'])
def create_oda():
    """Yeni oda oluştur"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        # Basit validasyon
        required_fields = ['oda_no', 'tip', 'fiyat', 'kapasite']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} alanı zorunludur'}), 400

        # Yeni oda ID'si
        new_id = max([room['oda_id'] for room in ROOMS]) + 1 if ROOMS else 1

        new_room = {
            'oda_id': new_id,
            'oda_no': data['oda_no'],
            'tip': data['tip'],
            'fiyat': float(data['fiyat']),
            'kapasite': int(data['kapasite']),
            'aktif': data.get('aktif', True)
        }

        ROOMS.append(new_room)
        return jsonify(new_room), 201

    except Exception as e:
        return jsonify({'message': 'Oda oluşturulamadı'}), 500

@bp.route('/odalar/<int:oda_id>', methods=['PUT'])
def update_oda(oda_id):
    """Oda güncelle"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        # Oda bul
        room = next((r for r in ROOMS if r['oda_id'] == oda_id), None)
        if not room:
            return jsonify({'message': 'Oda bulunamadı'}), 404

        # Güncelleme
        if 'oda_no' in data:
            room['oda_no'] = data['oda_no']
        if 'tip' in data:
            room['tip'] = data['tip']
        if 'fiyat' in data:
            room['fiyat'] = float(data['fiyat'])
        if 'kapasite' in data:
            room['kapasite'] = int(data['kapasite'])
        if 'aktif' in data:
            room['aktif'] = data['aktif']

        return jsonify(room), 200

    except Exception as e:
        return jsonify({'message': 'Oda güncellenemedi'}), 500

@bp.route('/odalar/<int:oda_id>', methods=['DELETE'])
def delete_oda(oda_id):
    """Oda sil"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        # Oda bul ve sil
        global ROOMS
        room = next((r for r in ROOMS if r['oda_id'] == oda_id), None)
        if not room:
            return jsonify({'message': 'Oda bulunamadı'}), 404

        ROOMS = [r for r in ROOMS if r['oda_id'] != oda_id]
        return jsonify({'message': 'Oda silindi'}), 200

    except Exception as e:
        return jsonify({'message': 'Oda silinemedi'}), 500
