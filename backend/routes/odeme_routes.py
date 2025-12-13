from flask import Blueprint, request, jsonify
from database import execute_query
from models.odeme import Odeme
from auth.jwt_utils import token_required

bp = Blueprint('odeme', __name__, url_prefix='/api/payments')

@bp.route('/', methods=['GET'])
@token_required
def get_payments(current_user):
    """Tum odemeleri listele (Korumali)"""
    try:
        query = """
        SELECT 
            o.odeme_id,
            o.rezervasyon_id,
            o.odenen_tutar,
            o.odeme_turu,
            o.odeme_tarihi,
            r.musteri_id
        FROM odemeler o
        INNER JOIN rezervasyonlar r ON o.rezervasyon_id = r.rezervasyon_id
        ORDER BY o.odeme_tarihi DESC
        """
        result = execute_query(query, fetch=True)

        payments = []
        for row in result:
            payment = Odeme.from_dict(row)
            payment_dict = payment.to_dict()
            # Musteri bilgisini ekle
            payment_dict['musteri_id'] = row.get('musteri_id')
            payments.append(payment_dict)

        return jsonify(payments), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:payment_id>', methods=['GET'])
@token_required
def get_payment_by_id(payment_id, current_user):
    """ID'ye gore odeme getir (Korumali)"""
    try:
        query = """
        SELECT 
            o.odeme_id,
            o.rezervasyon_id,
            o.odenen_tutar,
            o.odeme_turu,
            o.odeme_tarihi,
            r.musteri_id
        FROM odemeler o
        INNER JOIN rezervasyonlar r ON o.rezervasyon_id = r.rezervasyon_id
        WHERE o.odeme_id = %s
        """
        result = execute_query(query, params=(payment_id,), fetch=True)

        if not result:
            return jsonify({'error': 'Odeme bulunamadi'}), 404

        payment = Odeme.from_dict(result[0])
        payment_dict = payment.to_dict()
        payment_dict['musteri_id'] = result[0].get('musteri_id')

        return jsonify(payment_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_payment(current_user):
    """Yeni odeme olustur (Korumali)"""
    try:
        data = request.get_json()

        # Validasyon
        if not data.get('rezervasyon_id'):
            return jsonify({'error': 'rezervasyon_id alani zorunludur'}), 400

        if not data.get('odenen_tutar') or data.get('odenen_tutar', 0) <= 0:
            return jsonify({'error': 'odenen_tutar alani zorunludur ve 0\'dan buyuk olmalidir'}), 400

        if not data.get('odeme_turu'):
            return jsonify({'error': 'odeme_turu alani zorunludur'}), 400

        # Rezervasyon var mi kontrol et
        check_rez_query = "SELECT rezervasyon_id, musteri_id FROM rezervasyonlar WHERE rezervasyon_id = %s"
        existing_rez = execute_query(check_rez_query, params=(data['rezervasyon_id'],), fetch=True)
        if not existing_rez:
            return jsonify({'error': 'Gecersiz rezervasyon_id'}), 400

        # Odeme turu kontrolu
        odeme_turu = data['odeme_turu']
        if not Odeme().validate_odeme_turu(odeme_turu):
            return jsonify({
                'error': f'Gecersiz odeme_turu. Gecerli turler: {", ".join(Odeme.ODEME_TURU_CHOICES)}'
            }), 400

        # Yeni odeme olustur
        payment = Odeme(
            rezervasyon_id=data['rezervasyon_id'],
            odenen_tutar=float(data['odenen_tutar']),
            odeme_turu=odeme_turu
        )

        # Veritabanina ekle
        insert_query = """
        INSERT INTO odemeler (rezervasyon_id, odenen_tutar, odeme_turu, odeme_tarihi)
        VALUES (%s, %s, %s, NOW())
        """
        execute_query(insert_query, params=(
            payment.rezervasyon_id, payment.odenen_tutar, payment.odeme_turu
        ), fetch=False)

        # Eklenen odemenin ID'sini al
        last_id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(last_id_query, fetch=True)
        payment.odeme_id = id_result[0]['id']

        # Musteri bilgisini ekle
        payment_dict = payment.to_dict()
        payment_dict['musteri_id'] = existing_rez[0].get('musteri_id')

        return jsonify(payment_dict), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/customer/<int:customer_id>', methods=['GET'])
@token_required
def get_payments_by_customer(customer_id, current_user):
    """Musteri bazli odemeleri getir (Korumali)"""
    try:
        # Once musteri var mi kontrol et
        check_customer_query = "SELECT musteri_id FROM musteriler WHERE musteri_id = %s"
        existing_customer = execute_query(check_customer_query, params=(customer_id,), fetch=True)
        if not existing_customer:
            return jsonify({'error': 'Musteri bulunamadi'}), 404

        # Musterinin odemelerini getir (rezervasyonlar uzerinden)
        query = """
        SELECT 
            o.odeme_id,
            o.rezervasyon_id,
            o.odenen_tutar,
            o.odeme_turu,
            o.odeme_tarihi,
            r.musteri_id,
            r.giris_tarihi,
            r.cikis_tarihi,
            r.toplam_ucret
        FROM odemeler o
        INNER JOIN rezervasyonlar r ON o.rezervasyon_id = r.rezervasyon_id
        WHERE r.musteri_id = %s
        ORDER BY o.odeme_tarihi DESC
        """
        result = execute_query(query, params=(customer_id,), fetch=True)

        payments = []
        toplam_odenen = 0.0
        for row in result:
            payment = Odeme.from_dict(row)
            payment_dict = payment.to_dict()
            # Ek bilgileri ekle
            payment_dict['musteri_id'] = row.get('musteri_id')
            payment_dict['giris_tarihi'] = row.get('giris_tarihi').isoformat() if row.get('giris_tarihi') else None
            payment_dict['cikis_tarihi'] = row.get('cikis_tarihi').isoformat() if row.get('cikis_tarihi') else None
            payment_dict['toplam_ucret'] = float(row.get('toplam_ucret', 0)) if row.get('toplam_ucret') else None
            payments.append(payment_dict)
            toplam_odenen += payment.odenen_tutar

        return jsonify({
            'musteri_id': customer_id,
            'odemeler': payments,
            'toplam_odenen': round(toplam_odenen, 2),
            'odeme_sayisi': len(payments)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/reservation/<int:reservation_id>', methods=['GET'])
@token_required
def get_payments_by_reservation(reservation_id, current_user):
    """Rezervasyon bazli odemeleri getir (Korumali)"""
    try:
        # Once rezervasyon var mi kontrol et
        check_rez_query = """
        SELECT rezervasyon_id, musteri_id, toplam_ucret 
        FROM rezervasyonlar 
        WHERE rezervasyon_id = %s
        """
        existing_rez = execute_query(check_rez_query, params=(reservation_id,), fetch=True)
        if not existing_rez:
            return jsonify({'error': 'Rezervasyon bulunamadi'}), 404

        # Rezervasyonun odemelerini getir
        query = """
        SELECT 
            o.odeme_id,
            o.rezervasyon_id,
            o.odenen_tutar,
            o.odeme_turu,
            o.odeme_tarihi
        FROM odemeler o
        WHERE o.rezervasyon_id = %s
        ORDER BY o.odeme_tarihi DESC
        """
        result = execute_query(query, params=(reservation_id,), fetch=True)

        payments = []
        toplam_odenen = 0.0
        for row in result:
            payment = Odeme.from_dict(row)
            payments.append(payment.to_dict())
            toplam_odenen += payment.odenen_tutar

        rezervasyon_bilgisi = existing_rez[0]
        toplam_ucret = float(rezervasyon_bilgisi.get('toplam_ucret', 0)) if rezervasyon_bilgisi.get('toplam_ucret') else 0
        kalan_tutar = max(0, toplam_ucret - toplam_odenen)

        return jsonify({
            'rezervasyon_id': reservation_id,
            'musteri_id': rezervasyon_bilgisi.get('musteri_id'),
            'toplam_ucret': toplam_ucret,
            'toplam_odenen': round(toplam_odenen, 2),
            'kalan_tutar': round(kalan_tutar, 2),
            'odemeler': payments,
            'odeme_sayisi': len(payments)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:payment_id>', methods=['PUT'])
@token_required
def update_payment(payment_id, current_user):
    """Odeme bilgilerini guncelle (Korumali)"""
    try:
        # Once odeme var mi kontrol et
        check_query = "SELECT odeme_id FROM odemeler WHERE odeme_id = %s"
        existing = execute_query(check_query, params=(payment_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Odeme bulunamadi'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Guncellenecek veri bulunamadi'}), 400

        # Guncellenecek alanlari hazirla
        update_fields = []
        update_values = []

        if 'odenen_tutar' in data:
            if data['odenen_tutar'] <= 0:
                return jsonify({'error': 'Odenen tutar 0\'dan buyuk olmalidir'}), 400
            update_fields.append("odenen_tutar = %s")
            update_values.append(float(data['odenen_tutar']))

        if 'odeme_turu' in data:
            if not Odeme().validate_odeme_turu(data['odeme_turu']):
                return jsonify({
                    'error': f'Gecersiz odeme_turu. Gecerli turler: {", ".join(Odeme.ODEME_TURU_CHOICES)}'
                }), 400
            update_fields.append("odeme_turu = %s")
            update_values.append(data['odeme_turu'])

        if 'rezervasyon_id' in data:
            # Rezervasyon var mi kontrol et
            check_rez_query = "SELECT rezervasyon_id FROM rezervasyonlar WHERE rezervasyon_id = %s"
            existing_rez = execute_query(check_rez_query, params=(data['rezervasyon_id'],), fetch=True)
            if not existing_rez:
                return jsonify({'error': 'Gecersiz rezervasyon_id'}), 400
            update_fields.append("rezervasyon_id = %s")
            update_values.append(data['rezervasyon_id'])

        if not update_fields:
            return jsonify({'error': 'Guncellenecek alan bulunamadi'}), 400

        # Guncelleme sorgusu
        update_query = f"UPDATE odemeler SET {', '.join(update_fields)} WHERE odeme_id = %s"
        update_values.append(payment_id)

        execute_query(update_query, params=tuple(update_values), fetch=False)

        # Guncellenmis odemeyi getir
        select_query = """
        SELECT 
            o.odeme_id,
            o.rezervasyon_id,
            o.odenen_tutar,
            o.odeme_turu,
            o.odeme_tarihi,
            r.musteri_id
        FROM odemeler o
        INNER JOIN rezervasyonlar r ON o.rezervasyon_id = r.rezervasyon_id
        WHERE o.odeme_id = %s
        """
        result = execute_query(select_query, params=(payment_id,), fetch=True)
        payment = Odeme.from_dict(result[0])
        payment_dict = payment.to_dict()
        payment_dict['musteri_id'] = result[0].get('musteri_id')

        return jsonify(payment_dict), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:payment_id>', methods=['DELETE'])
@token_required
def delete_payment(payment_id, current_user):
    """Odeme sil (Korumali)"""
    try:
        # Once odeme var mi kontrol et
        check_query = "SELECT odeme_id FROM odemeler WHERE odeme_id = %s"
        existing = execute_query(check_query, params=(payment_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Odeme bulunamadi'}), 404

        # Silme islemi
        delete_query = "DELETE FROM odemeler WHERE odeme_id = %s"
        execute_query(delete_query, params=(payment_id,), fetch=False)

        return jsonify({'message': 'Odeme silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
