import pymysql
import pymysql.cursors
import os
from dotenv import load_dotenv
import logging
from contextlib import contextmanager
from typing import Optional, Dict, Any, List, Tuple

load_dotenv()

# Global connection pool
connection_pool = None

class DatabaseConnection:
    """PyMySQL tabanlı veritabanı bağlantı yöneticisi"""

    def __init__(self, host: str, user: str, password: str, database: str,
                 port: int = 3306, charset: str = 'utf8mb4'):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.port = port
        self.charset = charset
        self.connection = None

    def connect(self):
        """Veritabanına bağlanır"""
        try:
            self.connection = pymysql.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database,
                port=self.port,
                charset=self.charset,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False
            )
            return self.connection
        except pymysql.Error as e:
            logging.error(f"Veritabanı bağlantı hatası: {str(e)}")
            raise

    def disconnect(self):
        """Veritabanı bağlantısını kapatır"""
        if self.connection:
            try:
                self.connection.close()
            except Exception as e:
                logging.error(f"Bağlantı kapatma hatası: {str(e)}")
            finally:
                self.connection = None

    def __enter__(self):
        if not self.connection:
            self.connect()
        return self.connection

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            if self.connection:
                self.connection.rollback()
        else:
            if self.connection:
                self.connection.commit()
        self.disconnect()


def init_database(app=None):
    """
    Veritabanı bağlantı havuzunu başlatır.

    Args:
        app: Flask uygulama instance'ı (opsiyonel)
    """
    global connection_pool

    try:
        # Veritabanı bağlantı bilgilerini al
        if app:
            database_uri = app.config.get('DATABASE_URI')
        else:
            database_uri = os.getenv('DATABASE_URI', 'mysql://root:password@localhost/otel_otomasyonu_pro')

        if not database_uri:
            raise ValueError("DATABASE_URI konfigürasyonu bulunamadı")

        # URI'yi parse et (mysql://user:password@host:port/database)
        if database_uri.startswith('mysql://'):
            # Özel URI formatını parse et
            uri_parts = database_uri.replace('mysql://', '').split('@')
            if len(uri_parts) != 2:
                raise ValueError("Geçersiz DATABASE_URI formatı")

            user_pass = uri_parts[0].split(':')
            if len(user_pass) != 2:
                raise ValueError("Geçersiz kullanıcı bilgileri")

            host_port_db = uri_parts[1].split('/')
            if len(host_port_db) != 2:
                raise ValueError("Geçersiz host/database bilgisi")

            host_port = host_port_db[0].split(':')

            connection_config = {
                'user': user_pass[0],
                'password': user_pass[1],
                'host': host_port[0],
                'database': host_port_db[1],
                'port': int(host_port[1]) if len(host_port) > 1 else 3306
            }
        else:
            # pymysql:// formatını kullan (eğer varsa)
            if 'pymysql://' in database_uri:
                database_uri = database_uri.replace('pymysql://', 'mysql://')

            # Basit parse (kullanıcı:şifre@host:port/veritabanı)
            try:
                credentials, host_db = database_uri.split('@')
                user, password = credentials.split(':')
                host_port, database = host_db.split('/')
                host, port = host_port.split(':')

                connection_config = {
                    'user': user,
                    'password': password,
                    'host': host,
                    'database': database,
                    'port': int(port)
                }
            except:
                raise ValueError("Geçersiz DATABASE_URI formatı. Beklenen: user:password@host:port/database")

        # Bağlantı havuzu oluştur (şimdilik tek bağlantı)
        connection_pool = connection_config

        logging.info("Veritabanı bağlantı havuzu başarıyla oluşturuldu")

    except Exception as e:
        logging.error(f"Veritabanı başlatma hatası: {str(e)}")
        raise


@contextmanager
def get_db_connection():
    """
    Veritabanı bağlantısı sağlayan context manager.

    Yields:
        DatabaseConnection: Veritabanı bağlantısı

    Raises:
        Exception: Bağlantı hatası durumunda
    """
    if connection_pool is None:
        raise Exception("Veritabanı bağlantısı başlatılmamış. init_database() çağrılmalı.")

    db_conn = DatabaseConnection(**connection_pool)
    try:
        with db_conn as conn:
            yield conn
    except Exception as e:
        logging.error(f"Veritabanı bağlantı hatası: {str(e)}")
        raise


def execute_query(query: str, params: Optional[Tuple] = None, fetch: bool = True) -> Optional[List[Dict[str, Any]]]:
    """
    SQL sorgusu çalıştırır.

    Args:
        query: SQL sorgusu
        params: Sorgu parametreleri (tuple)
        fetch: Sonuçları getir (SELECT sorguları için True)

    Returns:
        List[Dict] veya None: Sorgu sonuçları (SELECT için) veya None

    Raises:
        Exception: Sorgu hatası durumunda
    """
    with get_db_connection() as conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())

                if fetch and query.strip().upper().startswith('SELECT'):
                    return cursor.fetchall()
                elif query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                    return cursor.rowcount
                else:
                    return None
        except Exception as e:
            conn.rollback()
            logging.error(f"Sorgu çalıştırma hatası: {str(e)} - Query: {query}")
            raise


def execute_many(query: str, params_list: List[Tuple]) -> int:
    """
    Çoklu SQL sorgusu çalıştırır (bulk insert/update).

    Args:
        query: SQL sorgusu
        params_list: Parametre listesi

    Returns:
        int: Etkilenen satır sayısı

    Raises:
        Exception: Sorgu hatası durumunda
    """
    with get_db_connection() as conn:
        try:
            with conn.cursor() as cursor:
                cursor.executemany(query, params_list)
                return cursor.rowcount
        except Exception as e:
            conn.rollback()
            logging.error(f"Çoklu sorgu çalıştırma hatası: {str(e)}")
            raise


def test_connection() -> Tuple[bool, str]:
    """
    Veritabanı bağlantısını test eder.

    Returns:
        tuple: (success: bool, message: str)
    """
    try:
        if connection_pool is None:
            return False, "Veritabanı bağlantısı başlatılmamış"

        # Basit bir sorgu ile bağlantıyı test et
        result = execute_query("SELECT 1 as test", fetch=True)

        if result and len(result) > 0:
            return True, "Veritabanı bağlantısı başarılı"
        else:
            return False, "Veritabanı sorgu hatası"

    except Exception as e:
        error_msg = f"Veritabanı bağlantı hatası: {str(e)}"
        logging.error(error_msg)
        return False, error_msg


def close_connection():
    """
    Veritabanı bağlantı havuzunu kapatır.
    """
    global connection_pool

    try:
        connection_pool = None
        logging.info("Veritabanı bağlantısı kapatıldı")

    except Exception as e:
        logging.error(f"Bağlantı kapatma hatası: {str(e)}")


# Logging yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

