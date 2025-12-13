from flask import Blueprint, jsonify
from database import execute_query
from auth.jwt_utils import token_required

bp = Blueprint('reports', __name__, url_prefix='/api/reports')


@bp.route('/monthly', methods=['GET'])
@token_required
def monthly_report(current_user):
    """Aylık kazanç raporu (MySQL view: monthly_report_view)"""
    try:
        query = "SELECT * FROM monthly_report_view ORDER BY ay DESC"
        result = execute_query(query, fetch=True)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/reservations', methods=['GET'])
@token_required
def reservation_report(current_user):
    """Detaylı rezervasyon raporu (MySQL view: reservation_report_view)"""
    try:
        query = "SELECT * FROM reservation_report_view ORDER BY giris_tarihi DESC"
        result = execute_query(query, fetch=True)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

