#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test backend startup"""

import sys
import traceback

try:
    print("✓ Importing Flask...")
    from flask import Flask
    
    print("✓ Importing CORS...")
    from flask_cors import CORS
    
    print("✓ Importing database...")
    from database import init_database, test_connection
    
    print("✓ Creating Flask app...")
    app = Flask(__name__)
    
    print("✓ Setting up CORS...")
    CORS(app)
    
    print("✓ Initializing database...")
    init_database(app)
    
    print("✓ Testing database connection...")
    success, msg = test_connection()
    print(f"  Database connection: {msg}")
    
    print("✓ Importing auth routes...")
    from routes.auth_routes import bp as auth_bp
    
    print("✓ Importing oda routes...")
    from routes.oda_routes import bp as rooms_bp
    
    print("✓ Importing musteri routes...")
    from routes.musteri_routes import bp as customers_bp
    
    print("✓ Importing rezervasyon routes...")
    from routes.rezervasyon_routes import bp as reservations_bp
    
    print("✓ Importing stok routes...")
    from routes.stok_routes import bp as stock_bp
    
    print("✓ Importing hizmet routes...")
    from routes.hizmet_routes import bp as services_bp
    
    print("✓ Importing odeme routes...")
    from routes.odeme_routes import bp as payments_bp
    
    print("✓ Importing personel routes...")
    from routes.personel_routes import bp as personel_bp
    
    print("✓ Importing report routes...")
    from routes.report_routes import bp as reports_bp
    
    print("✓ Registering blueprints...")
    app.register_blueprint(auth_bp)
    app.register_blueprint(rooms_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(reservations_bp)
    app.register_blueprint(stock_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(payments_bp)
    app.register_blueprint(personel_bp)
    app.register_blueprint(reports_bp)
    
    print("\n✅ All imports successful! Backend ready to start.")
    sys.exit(0)
    
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    traceback.print_exc()
    sys.exit(1)
