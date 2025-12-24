#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, jsonify
from flask_cors import CORS

# Sadece test blueprint'lerini import et
from routes.test_auth_routes import bp as test_auth_bp
from routes.test_oda_routes import bp as test_oda_bp
from routes.test_musteri_routes import bp as test_musteri_bp
from routes.test_rezervasyon_routes import bp as test_rezervasyon_bp

app = Flask(__name__)

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

# Test blueprint'leri kaydet
app.register_blueprint(test_auth_bp)
app.register_blueprint(test_oda_bp)
app.register_blueprint(test_musteri_bp)
app.register_blueprint(test_rezervasyon_bp)

@app.route('/')
def index():
    return {'message': 'Test API', 'status': 'running'}

@app.route('/api/test-routes', methods=['GET'])
def test_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/'):
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            routes.append({
                'methods': methods,
                'rule': rule.rule,
                'endpoint': rule.endpoint
            })
    return jsonify({
        'total_routes': len(routes),
        'routes': routes
    })

if __name__ == '__main__':
    print("=== TEST API ROUTES ===")
    api_routes = []
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/'):
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            api_routes.append(f"  {methods:8} {rule.rule}")

    for route in sorted(api_routes):
        print(route)

    print(f"\nTotal API routes: {len(api_routes)}")

    app.run(debug=True, host='0.0.0.0', port=5001)

