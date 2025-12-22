from flask import Blueprint, request, jsonify
from database import execute_query
from models.personel import Personel
from auth.jwt_utils import generate_token
from auth.password_utils import verify_password
from auth.rbac.roles import normalize_role

bp = Blueprint('auth', __name__, url_prefix='/api')


@bp.route('/login', methods=['POST', 'OPTIONS'])
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
    if request.method == 'OPTIONS':
        # CORS preflight request
        return jsonify({}), 200
    
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
        query = """
        SELECT personel_id, kullanici_adi, sifre, ad_soyad, gorev, aktiflik 
        FROM personel 
        WHERE kullanici_adi = %s
        """
        result = execute_query(query, params=(email,), fetch=True)
        
        if not result or len(result) == 0:
            return jsonify({
                'error': 'Giriş başarısız',
                'message': 'Email veya şifre hatalı'
            }), 401
        
        personel_data = result[0]
        
        # Aktiflik kontrolü
        if not personel_data.get('aktiflik'):
            return jsonify({
                'error': 'Hesap devre dışı',
                'message': 'Hesabınız aktif değil. Lütfen yöneticinizle iletişime geçin.'
            }), 401
        
        # Şifre kontrolü
        if not verify_password(password, personel_data.get('sifre')):
            return jsonify({
                'error': 'Giriş başarısız',
                'message': 'Email veya şifre hatalı'
            }), 401
        
        # Token üret
        token = generate_token(
            personel_id=personel_data.get('personel_id'),
            kullanici_adi=personel_data.get('kullanici_adi'),
            gorev=personel_data.get('gorev')
        )
        
        # Başarılı giriş
        user_role = normalize_role(personel_data.get('gorev'))
        return jsonify({
            'message': 'Giriş başarılı',
            'token': token,
            'user': {
                'personel_id': personel_data.get('personel_id'),
                'kullanici_adi': personel_data.get('kullanici_adi'),
                'ad_soyad': personel_data.get('ad_soyad'),
                'gorev': personel_data.get('gorev'),
                'role': user_role
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Sunucu hatası',
            'message': str(e)
        }), 500




