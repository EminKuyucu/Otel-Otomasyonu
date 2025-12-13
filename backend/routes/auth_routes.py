from flask import Blueprint, request, jsonify
from database import db
from models import Personel
from auth.jwt_utils import generate_token
from auth.password_utils import verify_password

bp = Blueprint('auth', __name__, url_prefix='/api')


@bp.route('/login', methods=['POST'])
def login():
    """
    Personel giriş endpoint'i.
    
    Request Body:
        {
            "email": "kullanici_adi",
            "password": "sifre"
        }
    
    Returns:
        JSON: Token ve kullanıcı bilgileri (200) veya hata mesajı (401)
    """
    try:
        data = request.get_json()
        
        # Email ve şifre kontrolü
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({
                'error': 'Eksik bilgi',
                'message': 'Email ve şifre gereklidir'
            }), 400
        
        email = data.get('email').strip()
        password = data.get('password')
        
        if not email or not password:
            return jsonify({
                'error': 'Geçersiz bilgi',
                'message': 'Email ve şifre boş olamaz'
            }), 400
        
        # Kullanıcıyı bul (kullanici_adi email olarak kullanılıyor)
        personel = Personel.query.filter_by(kullanici_adi=email).first()
        
        if not personel:
            return jsonify({
                'error': 'Giriş başarısız',
                'message': 'Email veya şifre hatalı'
            }), 401
        
        # Aktiflik kontrolü
        if not personel.aktiflik:
            return jsonify({
                'error': 'Hesap devre dışı',
                'message': 'Hesabınız aktif değil. Lütfen yöneticinizle iletişime geçin.'
            }), 401
        
        # Şifre kontrolü
        if not verify_password(password, personel.sifre):
            return jsonify({
                'error': 'Giriş başarısız',
                'message': 'Email veya şifre hatalı'
            }), 401
        
        # Token üret
        token = generate_token(
            personel_id=personel.personel_id,
            kullanici_adi=personel.kullanici_adi,
            gorev=personel.gorev
        )
        
        # Başarılı giriş
        return jsonify({
            'message': 'Giriş başarılı',
            'token': token,
            'user': {
                'personel_id': personel.personel_id,
                'kullanici_adi': personel.kullanici_adi,
                'ad_soyad': personel.ad_soyad,
                'gorev': personel.gorev
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Sunucu hatası',
            'message': str(e)
        }), 500


