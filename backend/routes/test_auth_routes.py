from flask import Blueprint, request, jsonify

bp = Blueprint('test_auth', __name__, url_prefix='/api')

# Test amaçlı dummy data
DUMMY_USERS = {
    "admin": {"password": "1234", "role": "personel"}
}

TEST_TOKEN = "test-token-123"

@bp.route('/login', methods=['POST'])
def login():
    """
    Test amaçlı personel giriş endpoint'i.

    Request Body (JSON):
    {
      "kullanici_adi": "admin",
      "sifre": "1234"
    }

    Returns:
        JSON: Token ve rol bilgileri veya hata mesajı
    """
    try:
        data = request.get_json()

        if not data or 'kullanici_adi' not in data or 'sifre' not in data:
            return jsonify({
                'message': 'Yetkisiz giriş'
            }), 401

        username = data.get('kullanici_adi')
        password = data.get('sifre')

        # Dummy user kontrolü
        if username in DUMMY_USERS and DUMMY_USERS[username]['password'] == password:
            return jsonify({
                'token': TEST_TOKEN,
                'rol': DUMMY_USERS[username]['role']
            }), 200
        else:
            return jsonify({
                'message': 'Yetkisiz giriş'
            }), 401

    except Exception as e:
        return jsonify({
            'message': 'Yetkisiz giriş'
        }), 401

@bp.route('/logout', methods=['POST'])
def logout():
    """
    Test amaçlı oturum sonlandırma endpoint'i.

    Returns:
        JSON: Başarılı çıkış mesajı
    """
    return jsonify({
        'message': 'Oturum sonlandırıldı'
    }), 200
