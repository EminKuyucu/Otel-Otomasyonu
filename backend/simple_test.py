#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# Backend dizinine git
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    # Sadece test blueprint'lerini import et
    from routes.test_auth_routes import bp as test_auth_bp
    from routes.test_oda_routes import bp as test_oda_bp
    from routes.test_musteri_routes import bp as test_musteri_bp
    from routes.test_rezervasyon_routes import bp as test_rezervasyon_bp

    from flask import Flask

    app = Flask(__name__)

    # Test blueprint'leri kaydet
    app.register_blueprint(test_auth_bp)
    app.register_blueprint(test_oda_bp)
    app.register_blueprint(test_musteri_bp)
    app.register_blueprint(test_rezervasyon_bp)

    print("=== TEST API ROUTES ===")
    api_routes = []
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/'):
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            api_routes.append(f"  {methods:8} {rule.rule}")

    for route in sorted(api_routes):
        print(route)

    print(f"\nTotal API routes: {len(api_routes)}")

except Exception as e:
    print(f"Hata: {e}")
    import traceback
    traceback.print_exc()

