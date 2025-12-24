#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# Backend dizinine git
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

try:
    from app import app

    print("=== REGISTERED BLUEPRINTS ===")
    for name, blueprint in app.blueprints.items():
        print(f"  {name}")

    print("\n=== ALL API ROUTES ===")
    api_routes = []
    for rule in app.url_map.iter_rules():
        if rule.rule.startswith('/api/'):
            methods = ','.join(rule.methods - {'HEAD', 'OPTIONS'})
            api_routes.append(f"  {methods:8} {rule.rule}")

    # Sırala
    for route in sorted(api_routes):
        print(route)

    print(f"\nTotal API routes: {len(api_routes)}")

except Exception as e:
    print(f"Hata: {e}")
    import traceback
    traceback.print_exc()

