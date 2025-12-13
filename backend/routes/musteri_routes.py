from flask import Blueprint, request, jsonify
from database import execute_query
from models.musteri import Musteri
from models.musteri_harcama import MusteriHarcama
from models.musteri_degerlendirme import MusteriDegerlendirme
from auth.jwt_utils import token_required

bp = Blueprint('musteri', __name__, url_prefix='/api/customers')

@bp.route('/', methods=['GET'])
@token_required
def get_customers(current_user):
    """Tum musterileri listele (Korumali)"""
    try:
        query = """
        SELECT musteri_id, ad, soyad, tc_kimlik_no, telefon, email, 
               cinsiyet, adres, ozel_notlar, kayit_tarihi 
        FROM musteriler 
        ORDER BY kayit_tarihi DESC
        """
        result = execute_query(query, fetch=True)

        customers = []
        for row in result:
            customer = Musteri.from_dict(row)
            customers.append(customer.to_dict())

        return jsonify(customers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:customer_id>', methods=['GET'])
@token_required
def get_customer_by_id(customer_id, current_user):
    """ID'ye gore musteri getir (Korumali)"""
    try:
        query = """
        SELECT musteri_id, ad, soyad, tc_kimlik_no, telefon, email, 
               cinsiyet, adres, ozel_notlar, kayit_tarihi 
        FROM musteriler 
        WHERE musteri_id = %s
        """
        result = execute_query(query, params=(customer_id,), fetch=True)

        if not result:
            return jsonify({'error': 'Musteri bulunamadi'}), 404

        customer = Musteri.from_dict(result[0])
        return jsonify(customer.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_customer(current_user):
    """Yeni musteri olustur (Korumali)"""
    try:
        data = request.get_json()

        # Validasyon
        required_fields = ['ad', 'soyad', 'telefon']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} alani zorunludur'}), 400

        # TC Kimlik No benzersiz mi kontrol et (varsa)
        if data.get('tc_kimlik_no'):
            check_tc_query = "SELECT musteri_id FROM musteriler WHERE tc_kimlik_no = %s"
            existing_tc = execute_query(check_tc_query, params=(data['tc_kimlik_no'],), fetch=True)
            if existing_tc:
                return jsonify({'error': 'Bu TC Kimlik No zaten kayitli'}), 400

        # Email benzersiz mi kontrol et (varsa)
        if data.get('email'):
            check_email_query = "SELECT musteri_id FROM musteriler WHERE email = %s"
            existing_email = execute_query(check_email_query, params=(data['email'],), fetch=True)
            if existing_email:
                return jsonify({'error': 'Bu email adresi zaten kayitli'}), 400

        # Cinsiyet kontrolu
        cinsiyet = data.get('cinsiyet', Musteri.CINSIYET_BELIRTILMEMIS)
        if not Musteri().validate_gender(cinsiyet):
            return jsonify({'error': f'Gecersiz cinsiyet: {cinsiyet}'}), 400

        # Yeni musteri olustur
        customer = Musteri(
            ad=data['ad'],
            soyad=data['soyad'],
            tc_kimlik_no=data.get('tc_kimlik_no', ''),
            telefon=data['telefon'],
            email=data.get('email'),
            cinsiyet=cinsiyet,
            adres=data.get('adres'),
            ozel_notlar=data.get('ozel_notlar')
        )

        # Veritabanina ekle
        insert_query = """
        INSERT INTO musteriler (ad, soyad, tc_kimlik_no, telefon, email, cinsiyet, adres, ozel_notlar, kayit_tarihi)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        execute_query(insert_query, params=(
            customer.ad, customer.soyad, customer.tc_kimlik_no, customer.telefon,
            customer.email, customer.cinsiyet, customer.adres, customer.ozel_notlar
        ), fetch=False)

        # Eklenen musterinin ID'sini al
        last_id_query = "SELECT LAST_INSERT_ID() as id"
        id_result = execute_query(last_id_query, fetch=True)
        customer.musteri_id = id_result[0]['id']

        return jsonify(customer.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:customer_id>', methods=['PUT'])
@token_required
def update_customer(customer_id, current_user):
    """Musteri bilgilerini guncelle (Korumali)"""
    try:
        # Once musteri var mi kontrol et
        check_query = "SELECT musteri_id FROM musteriler WHERE musteri_id = %s"
        existing = execute_query(check_query, params=(customer_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Musteri bulunamadi'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Guncellenecek veri bulunamadi'}), 400

        # Guncellenecek alanlari hazirla
        update_fields = []
        update_values = []

        if 'ad' in data:
            update_fields.append("ad = %s")
            update_values.append(data['ad'])

        if 'soyad' in data:
            update_fields.append("soyad = %s")
            update_values.append(data['soyad'])

        if 'tc_kimlik_no' in data:
            # TC Kimlik No benzersiz mi kontrol et (kendi ID'si haric)
            check_tc_query = "SELECT musteri_id FROM musteriler WHERE tc_kimlik_no = %s AND musteri_id != %s"
            existing_tc = execute_query(check_tc_query, params=(data['tc_kimlik_no'], customer_id), fetch=True)
            if existing_tc:
                return jsonify({'error': 'Bu TC Kimlik No zaten kayitli'}), 400
            update_fields.append("tc_kimlik_no = %s")
            update_values.append(data['tc_kimlik_no'])

        if 'telefon' in data:
            update_fields.append("telefon = %s")
            update_values.append(data['telefon'])

        if 'email' in data:
            # Email benzersiz mi kontrol et (kendi ID'si haric)
            check_email_query = "SELECT musteri_id FROM musteriler WHERE email = %s AND musteri_id != %s"
            existing_email = execute_query(check_email_query, params=(data['email'], customer_id), fetch=True)
            if existing_email:
                return jsonify({'error': 'Bu email adresi zaten kayitli'}), 400
            update_fields.append("email = %s")
            update_values.append(data['email'])

        if 'cinsiyet' in data:
            if not Musteri().validate_gender(data['cinsiyet']):
                return jsonify({'error': f'Gecersiz cinsiyet: {data["cinsiyet"]}'}), 400
            update_fields.append("cinsiyet = %s")
            update_values.append(data['cinsiyet'])

        if 'adres' in data:
            update_fields.append("adres = %s")
            update_values.append(data['adres'])

        if 'ozel_notlar' in data:
            update_fields.append("ozel_notlar = %s")
            update_values.append(data['ozel_notlar'])

        if not update_fields:
            return jsonify({'error': 'Guncellenecek alan bulunamadi'}), 400

        # Guncelleme sorgusu
        update_query = f"UPDATE musteriler SET {', '.join(update_fields)} WHERE musteri_id = %s"
        update_values.append(customer_id)

        execute_query(update_query, params=tuple(update_values), fetch=False)

        # Guncellenmis musteriyi getir
        select_query = """
        SELECT musteri_id, ad, soyad, tc_kimlik_no, telefon, email, 
               cinsiyet, adres, ozel_notlar, kayit_tarihi 
        FROM musteriler 
        WHERE musteri_id = %s
        """
        result = execute_query(select_query, params=(customer_id,), fetch=True)
        customer = Musteri.from_dict(result[0])

        return jsonify(customer.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:customer_id>', methods=['DELETE'])
@token_required
def delete_customer(customer_id, current_user):
    """Musteri sil (Korumali)"""
    try:
        # Once musteri var mi kontrol et
        check_query = "SELECT musteri_id FROM musteriler WHERE musteri_id = %s"
        existing = execute_query(check_query, params=(customer_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Musteri bulunamadi'}), 404

        # Aktif rezervasyon var mi kontrol et
        rez_check_query = """
        SELECT COUNT(*) as count 
        FROM rezervasyonlar 
        WHERE musteri_id = %s AND durum IN ('aktif', 'onaylandi')
        """
        rez_result = execute_query(rez_check_query, params=(customer_id,), fetch=True)
        if rez_result and rez_result[0]['count'] > 0:
            return jsonify({'error': 'Bu musterinin aktif rezervasyonu bulundugu icin silinemez'}), 400

        # Silme islemi
        delete_query = "DELETE FROM musteriler WHERE musteri_id = %s"
        execute_query(delete_query, params=(customer_id,), fetch=False)

        return jsonify({'message': 'Musteri silindi'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<int:customer_id>/harcamalar', methods=['GET'])
@token_required
def get_customer_expenses(customer_id, current_user):
    """Musterinin harcamalarini getir (Korumali)"""
    try:
        # Once musteri var mi kontrol et
        check_query = "SELECT musteri_id FROM musteriler WHERE musteri_id = %s"
        existing = execute_query(check_query, params=(customer_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Musteri bulunamadi'}), 404

        # Musterinin harcamalarini getir (rezervasyonlar uzerinden)
        query = """
        SELECT 
            mh.harcama_id,
            mh.rezervasyon_id,
            mh.hizmet_id,
            mh.adet,
            mh.toplam_fiyat,
            mh.islem_tarihi,
            eh.hizmet_adi,
            eh.fiyat as birim_fiyat
        FROM musteri_harcamalari mh
        INNER JOIN rezervasyonlar r ON mh.rezervasyon_id = r.rezervasyon_id
        LEFT JOIN ekstra_hizmetler eh ON mh.hizmet_id = eh.hizmet_id
        WHERE r.musteri_id = %s
        ORDER BY mh.islem_tarihi DESC
        """
        result = execute_query(query, params=(customer_id,), fetch=True)

        expenses = []
        for row in result:
            expense = MusteriHarcama.from_dict(row)
            expense_dict = expense.to_dict()
            # Ek bilgileri ekle
            expense_dict['hizmet_adi'] = row.get('hizmet_adi')
            expense_dict['birim_fiyat'] = float(row.get('birim_fiyat', 0)) if row.get('birim_fiyat') else None
            expenses.append(expense_dict)

        return jsonify({
            'musteri_id': customer_id,
            'harcamalar': expenses,
            'toplam_harcama': sum(float(e['toplam_fiyat']) for e in expenses)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:customer_id>/degerlendirme', methods=['GET'])
@token_required
def get_customer_reviews(customer_id, current_user):
    """Musterinin degerlendirmelerini getir (Korumali)"""
    try:
        # Once musteri var mi kontrol et
        check_query = "SELECT musteri_id FROM musteriler WHERE musteri_id = %s"
        existing = execute_query(check_query, params=(customer_id,), fetch=True)
        if not existing:
            return jsonify({'error': 'Musteri bulunamadi'}), 404

        # Musterinin degerlendirmelerini getir (rezervasyonlar uzerinden)
        query = """
        SELECT 
            md.degerlendirme_id,
            md.rezervasyon_id,
            md.puan,
            md.yorum,
            r.giris_tarihi,
            r.cikis_tarihi
        FROM musteri_degerlendirme md
        INNER JOIN rezervasyonlar r ON md.rezervasyon_id = r.rezervasyon_id
        WHERE r.musteri_id = %s
        ORDER BY md.degerlendirme_id DESC
        """
        result = execute_query(query, params=(customer_id,), fetch=True)

        reviews = []
        for row in result:
            review = MusteriDegerlendirme.from_dict(row)
            review_dict = review.to_dict()
            # Ek bilgileri ekle
            review_dict['giris_tarihi'] = row.get('giris_tarihi').isoformat() if row.get('giris_tarihi') else None
            review_dict['cikis_tarihi'] = row.get('cikis_tarihi').isoformat() if row.get('cikis_tarihi') else None
            reviews.append(review_dict)

        # Ortalama puan hesapla
        puanlar = [r['puan'] for r in reviews if r['puan'] is not None]
        ortalama_puan = sum(puanlar) / len(puanlar) if puanlar else None

        return jsonify({
            'musteri_id': customer_id,
            'degerlendirmeler': reviews,
            'toplam_degerlendirme': len(reviews),
            'ortalama_puan': round(ortalama_puan, 2) if ortalama_puan else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
