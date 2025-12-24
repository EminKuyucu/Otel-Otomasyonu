from flask import Blueprint, request, jsonify
from datetime import datetime

bp = Blueprint('test_rezervasyon', __name__, url_prefix='/api')

# Test amaçlı dummy data
RESERVATIONS = [
    {
        "rezervasyon_id": 1,
        "musteri_id": 1,
        "oda_id": 1,
        "giris_tarihi": "2024-01-15",
        "cikis_tarihi": "2024-01-17",
        "yetiskin_sayisi": 2,
        "cocuk_sayisi": 0,
        "rezervasyon_tipi": "Kapıdan",
        "rezervasyon_durumu": "Aktif",
        "toplam_ucret": 300.00
    },
    {
        "rezervasyon_id": 2,
        "musteri_id": 2,
        "oda_id": 2,
        "giris_tarihi": "2024-01-20",
        "cikis_tarihi": "2024-01-22",
        "yetiskin_sayisi": 1,
        "cocuk_sayisi": 1,
        "rezervasyon_tipi": "Online",
        "rezervasyon_durumu": "Bekliyor",
        "toplam_ucret": 500.00
    }
]

def check_auth():
    """Test amaçlı basit auth kontrolü"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return False
    token = auth_header.split(' ')[1]
    return token == "test-token-123"

@bp.route('/rezervasyonlar', methods=['GET'])
def get_rezervasyonlar():
    """Tüm rezervasyonları listele"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    return jsonify(RESERVATIONS), 200

@bp.route('/rezervasyonlar', methods=['POST'])
def create_rezervasyon():
    """Yeni rezervasyon oluştur"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        # Basit validasyon
        required_fields = ['musteri_id', 'oda_id', 'giris_tarihi', 'cikis_tarihi', 'yetiskin_sayisi']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} alanı zorunludur'}), 400

        # Yeni rezervasyon ID'si
        new_id = max([r['rezervasyon_id'] for r in RESERVATIONS]) + 1 if RESERVATIONS else 1

        # Basit fiyat hesaplama (örnek: oda fiyatı * gün sayısı)
        oda_fiyat = 150.00  # Dummy oda fiyatı
        giris = datetime.strptime(data['giris_tarihi'], '%Y-%m-%d')
        cikis = datetime.strptime(data['cikis_tarihi'], '%Y-%m-%d')
        gun_sayisi = (cikis - giris).days
        toplam_ucret = oda_fiyat * gun_sayisi

        new_reservation = {
            'rezervasyon_id': new_id,
            'musteri_id': int(data['musteri_id']),
            'oda_id': int(data['oda_id']),
            'giris_tarihi': data['giris_tarihi'],
            'cikis_tarihi': data['cikis_tarihi'],
            'yetiskin_sayisi': int(data['yetiskin_sayisi']),
            'cocuk_sayisi': int(data.get('cocuk_sayisi', 0)),
            'rezervasyon_tipi': data.get('rezervasyon_tipi', 'Kapıdan'),
            'rezervasyon_durumu': data.get('rezervasyon_durumu', 'Aktif'),
            'toplam_ucret': toplam_ucret
        }

        RESERVATIONS.append(new_reservation)
        return jsonify(new_reservation), 201

    except Exception as e:
        return jsonify({'message': 'Rezervasyon oluşturulamadı'}), 500

@bp.route('/rezervasyonlar/<int:rezervasyon_id>', methods=['PUT'])
def update_rezervasyon(rezervasyon_id):
    """Rezervasyon güncelle"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        # Rezervasyon bul
        reservation = next((r for r in RESERVATIONS if r['rezervasyon_id'] == rezervasyon_id), None)
        if not reservation:
            return jsonify({'message': 'Rezervasyon bulunamadı'}), 404

        # Güncelleme
        if 'musteri_id' in data:
            reservation['musteri_id'] = int(data['musteri_id'])
        if 'oda_id' in data:
            reservation['oda_id'] = int(data['oda_id'])
        if 'giris_tarihi' in data:
            reservation['giris_tarihi'] = data['giris_tarihi']
        if 'cikis_tarihi' in data:
            reservation['cikis_tarihi'] = data['cikis_tarihi']
        if 'yetiskin_sayisi' in data:
            reservation['yetiskin_sayisi'] = int(data['yetiskin_sayisi'])
        if 'cocuk_sayisi' in data:
            reservation['cocuk_sayisi'] = int(data['cocuk_sayisi'])
        if 'rezervasyon_tipi' in data:
            reservation['rezervasyon_tipi'] = data['rezervasyon_tipi']
        if 'rezervasyon_durumu' in data:
            reservation['rezervasyon_durumu'] = data['rezervasyon_durumu']

        # Toplam ücreti yeniden hesapla
        if 'oda_id' in data or 'giris_tarihi' in data or 'cikis_tarihi' in data:
            oda_fiyat = 150.00  # Dummy oda fiyatı
            giris = datetime.strptime(reservation['giris_tarihi'], '%Y-%m-%d')
            cikis = datetime.strptime(reservation['cikis_tarihi'], '%Y-%m-%d')
            gun_sayisi = (cikis - giris).days
            reservation['toplam_ucret'] = oda_fiyat * gun_sayisi

        return jsonify(reservation), 200

    except Exception as e:
        return jsonify({'message': 'Rezervasyon güncellenemedi'}), 500

@bp.route('/rezervasyonlar/<int:rezervasyon_id>', methods=['DELETE'])
def delete_rezervasyon(rezervasyon_id):
    """Rezervasyon sil"""
    if not check_auth():
        return jsonify({'message': 'Yetkisiz erişim'}), 401

    try:
        # Rezervasyon bul ve sil
        global RESERVATIONS
        reservation = next((r for r in RESERVATIONS if r['rezervasyon_id'] == rezervasyon_id), None)
        if not reservation:
            return jsonify({'message': 'Rezervasyon bulunamadı'}), 404

        RESERVATIONS = [r for r in RESERVATIONS if r['rezervasyon_id'] != rezervasyon_id]
        return jsonify({'message': 'Rezervasyon silindi'}), 200

    except Exception as e:
        return jsonify({'message': 'Rezervasyon silinemedi'}), 500
