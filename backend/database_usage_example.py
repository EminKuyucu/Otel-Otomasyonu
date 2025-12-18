"""
Veritabanı bağlantı fonksiyonlarının kullanım örnekleri.

Bu dosya sadece referans amaçlıdır ve çalıştırılması gerekmez.
"""

from database import get_db_session, test_connection, close_connection
from sqlalchemy.exc import SQLAlchemyError

# Örnek 1: Bağlantıyı test etme
def example_test_connection():
    """Bağlantıyı test etme örneği"""
    success, message = test_connection()
    if success:
        print(f"Başarılı: {message}")
    else:
        print(f"Hata: {message}")


# Örnek 2: Session kullanarak sorgu çalıştırma
def example_query_with_session():
    """Session kullanarak sorgu çalıştırma örneği"""
    session = get_db_session()
    try:
        # Örnek sorgu
        from sqlalchemy import text
        result = session.execute(text("SELECT COUNT(*) FROM personel"))
        count = result.scalar()
        print(f"Personel sayısı: {count}")
        
        # Değişiklikleri kaydet
        session.commit()
        
    except SQLAlchemyError as e:
        # Hata durumunda rollback yap
        session.rollback()
        print(f"Veritabanı hatası: {str(e)}")
        
    finally:
        # Session'ı kapat
        session.close()


# Örnek 3: Context manager ile session kullanımı
def example_context_manager():
    """Context manager ile güvenli session kullanımı"""
    session = get_db_session()
    try:
        # İşlemler burada yapılır
        pass
    except Exception as e:
        session.rollback()
        print(f"Hata: {str(e)}")
    finally:
        session.close()


# Örnek 4: Flask route içinde kullanım
def example_flask_route():
    """
    Flask route içinde kullanım örneği:
    
    @app.route('/api/example')
    def example():
        session = get_db_session()
        try:
            # Veritabanı işlemleri
            result = session.execute(text("SELECT * FROM personel LIMIT 10"))
            data = [dict(row) for row in result]
            return jsonify(data), 200
        except SQLAlchemyError as e:
            session.rollback()
            return jsonify({'error': str(e)}), 500
        finally:
            session.close()
    """







