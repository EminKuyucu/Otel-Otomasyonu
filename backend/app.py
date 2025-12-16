from flask import Flask, jsonify
from flask_cors import CORS
from database import init_database, test_connection, close_connection
import os
from dotenv import load_dotenv
import atexit

load_dotenv()

app = Flask(__name__)

# Trailing slash gerektirmeme
app.url_map.strict_slashes = False

# CORS ayarları
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"],
        "expose_headers": ["Access-Control-Allow-Origin"],
        "supports_credentials": False
    }
})

# Veritabanı bağlantı ayarları
app.config['DATABASE_URI'] = os.getenv(
    'DATABASE_URI',
    'mysql://root:13524qwe@localhost/otel_otomasyonu_pro'
)

# Veritabanı bağlantısını başlat
try:
    init_database(app)
except Exception as e:
    print(f"UYARI: Veritabanı bağlantısı başlatılamadı: {str(e)}")
    print("Uygulama çalışmaya devam edecek ancak veritabanı işlemleri başarısız olabilir.")

# Uygulama kapanırken bağlantıyı kapat
atexit.register(close_connection)

# Route'lari import et
from routes.auth_routes import bp as auth_bp
from routes.oda_routes import bp as rooms_bp
from routes.musteri_routes import bp as customers_bp
from routes.personel_routes import bp as staff_bp
from routes.rezervasyon_routes import bp as reservations_bp
from routes.stok_routes import bp as stock_bp
from routes.hizmet_routes import bp as services_bp
from routes.odeme_routes import bp as payments_bp
from routes.report_routes import bp as reports_bp

# Blueprint'leri kaydet
app.register_blueprint(auth_bp)
app.register_blueprint(rooms_bp)
app.register_blueprint(customers_bp)
app.register_blueprint(staff_bp)
app.register_blueprint(reservations_bp)
app.register_blueprint(stock_bp)
app.register_blueprint(services_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(reports_bp)

@app.route('/')
def index():
    return {'message': 'Otel Otomasyonu API', 'status': 'running'}

@app.route('/api/test-db', methods=['GET'])
def test_db():
    """
    Veritabanı bağlantısını test eden endpoint.
    
    Returns:
        JSON: Bağlantı durumu ve mesajı
    """
    success, message = test_connection()
    
    if success:
        return jsonify({
            'status': 'connected',
            'message': message
        }), 200
    else:
        return jsonify({
            'status': 'error',
            'message': message
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

