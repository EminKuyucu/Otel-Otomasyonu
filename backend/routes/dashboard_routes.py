from flask import Blueprint, jsonify
from database import execute_query
from auth.jwt_utils import token_required
from auth.rbac.decorators import read_required

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@bp.route('/stats', methods=['GET'])
@token_required
@read_required('dashboard')
def get_dashboard_stats(current_user):
    """
    Dashboard istatistiklerini döndüren endpoint.

    İstatistikler:
    - Toplam rezervasyon sayısı
    - Dolu oda sayısı
    - Müsait oda sayısı
    - Bugün giriş yapacak müşteri sayısı
    - Toplam müşteri sayısı

    Returns:
        JSON: Dashboard istatistikleri
    """
    try:
        # Toplam rezervasyon sayısı
        total_reservations_query = "SELECT COUNT(*) as count FROM rezervasyonlar"
        total_reservations_result = execute_query(total_reservations_query, fetch=True)
        total_reservations = total_reservations_result[0]['count'] if total_reservations_result else 0

        # Dolu oda sayısı (durum = 'Dolu')
        occupied_rooms_query = "SELECT COUNT(*) as count FROM odalar WHERE durum = 'Dolu'"
        occupied_rooms_result = execute_query(occupied_rooms_query, fetch=True)
        occupied_rooms = occupied_rooms_result[0]['count'] if occupied_rooms_result else 0

        # Müsait oda sayısı (durum = 'Boş')
        available_rooms_query = "SELECT COUNT(*) as count FROM odalar WHERE durum = 'Boş'"
        available_rooms_result = execute_query(available_rooms_query, fetch=True)
        available_rooms = available_rooms_result[0]['count'] if available_rooms_result else 0

        # Bugün giriş yapacak müşteri sayısı (bugün tarihli girişler)
        import datetime
        today = datetime.date.today().isoformat()
        todays_checkins_query = """
            SELECT COUNT(*) as count
            FROM rezervasyonlar
            WHERE DATE(giris_tarihi) = %s AND rezervasyon_durumu IN ('Aktif', 'Bekliyor')
        """
        todays_checkins_result = execute_query(todays_checkins_query, params=(today,), fetch=True)
        todays_checkins = todays_checkins_result[0]['count'] if todays_checkins_result else 0

        # Toplam müşteri sayısı
        total_customers_query = "SELECT COUNT(*) as count FROM musteriler"
        total_customers_result = execute_query(total_customers_query, fetch=True)
        total_customers = total_customers_result[0]['count'] if total_customers_result else 0

        # Doluluk oranı hesaplama
        total_rooms_query = "SELECT COUNT(*) as count FROM odalar"
        total_rooms_result = execute_query(total_rooms_query, fetch=True)
        total_rooms = total_rooms_result[0]['count'] if total_rooms_result else 0

        occupancy_rate = 0
        if total_rooms > 0:
            occupancy_rate = round((occupied_rooms / total_rooms) * 100, 1)

        stats = {
            'total_reservations': total_reservations,
            'occupied_rooms': occupied_rooms,
            'available_rooms': available_rooms,
            'todays_checkins': todays_checkins,
            'total_customers': total_customers,
            'occupancy_rate': occupancy_rate,
            'total_rooms': total_rooms
        }

        return jsonify({
            'success': True,
            'data': stats
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Dashboard istatistikleri alınırken hata oluştu: {str(e)}'
        }), 500

@bp.route('/active-reservations', methods=['GET'])
@token_required
@read_required('dashboard')
def get_active_reservations(current_user):
    """
    Aktif rezervasyonları döndüren endpoint.

    Returns:
        JSON: Aktif rezervasyon listesi
    """
    try:
        query = """
            SELECT
                r.rezervasyon_id,
                CONCAT(m.ad, ' ', m.soyad) as musteri_adi,
                o.oda_numarasi,
                r.giris_tarihi,
                r.cikis_tarihi,
                r.rezervasyon_durumu,
                r.toplam_ucret
            FROM rezervasyonlar r
            JOIN musteriler m ON r.musteri_id = m.musteri_id
            JOIN odalar o ON r.oda_id = o.oda_id
            WHERE r.rezervasyon_durumu IN ('Aktif', 'Bekliyor')
            ORDER BY r.giris_tarihi ASC
            LIMIT 10
        """

        results = execute_query(query, fetch=True)

        reservations = []
        for row in results:
            reservations.append({
                'id': row['rezervasyon_id'],
                'name': row['musteri_adi'],
                'room': row['oda_numarasi'],
                'checkin_date': str(row['giris_tarihi']) if row['giris_tarihi'] else None,
                'checkout_date': str(row['cikis_tarihi']) if row['cikis_tarihi'] else None,
                'status': row['rezervasyon_durumu'],
                'total_price': float(row['toplam_ucret']) if row['toplam_ucret'] else 0.0
            })

        return jsonify({
            'success': True,
            'data': reservations
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Aktif rezervasyonlar alınırken hata oluştu: {str(e)}'
        }), 500

@bp.route('/todays-events', methods=['GET'])
@token_required
@read_required('dashboard')
def get_todays_events(current_user):
    """
    Bugünkü giriş/çıkış olaylarını döndüren endpoint.

    Returns:
        JSON: Bugünkü olaylar listesi
    """
    try:
        import datetime
        today = datetime.date.today().isoformat()

        # Bugün giriş yapacaklar
        checkins_query = """
            SELECT
                'checkin' as type,
                CONCAT(m.ad, ' ', m.soyad) as name,
                o.oda_numarasi as room,
                TIME(r.giris_tarihi) as time
            FROM rezervasyonlar r
            JOIN musteriler m ON r.musteri_id = m.musteri_id
            JOIN odalar o ON r.oda_id = o.oda_id
            WHERE DATE(r.giris_tarihi) = %s AND r.rezervasyon_durumu = 'Aktif'
            ORDER BY r.giris_tarihi ASC
        """

        # Bugün çıkış yapacaklar
        checkouts_query = """
            SELECT
                'checkout' as type,
                CONCAT(m.ad, ' ', m.soyad) as name,
                o.oda_numarasi as room,
                TIME(r.cikis_tarihi) as time
            FROM rezervasyonlar r
            JOIN musteriler m ON r.musteri_id = m.musteri_id
            JOIN odalar o ON r.oda_id = o.oda_id
            WHERE DATE(r.cikis_tarihi) = %s AND r.rezervasyon_durumu = 'Aktif'
            ORDER BY r.cikis_tarihi ASC
        """

        checkins = execute_query(checkins_query, params=(today,), fetch=True)
        checkouts = execute_query(checkouts_query, params=(today,), fetch=True)

        events = []

        # Check-in'leri ekle
        for event in checkins:
            events.append({
                'type': event['type'],
                'name': event['name'],
                'room': event['room'],
                'time': str(event['time']) if event['time'] else '00:00:00'
            })

        # Check-out'ları ekle
        for event in checkouts:
            events.append({
                'type': event['type'],
                'name': event['name'],
                'room': event['room'],
                'time': str(event['time']) if event['time'] else '00:00:00'
            })

        # Zamana göre sırala
        events.sort(key=lambda x: x['time'])

        return jsonify({
            'success': True,
            'data': events
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Bugünkü olaylar alınırken hata oluştu: {str(e)}'
        }), 500
