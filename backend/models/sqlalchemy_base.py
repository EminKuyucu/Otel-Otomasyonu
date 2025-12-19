"""
SQLAlchemy ORM modelleri için base konfigürasyonu.

Bu modül mevcut PyMySQL tabanlı backend yapısını etkilemez.
SQLAlchemy sadece ORM modelleri olarak kullanılır.
"""

from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, DECIMAL, Enum, Text, TIMESTAMP, func, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# SQLAlchemy Base
Base = declarative_base()

# Veritabanı URL'sini oluştur (mevcut database.py'den benzer şekilde)
def get_database_url():
    """Mevcut database.py'deki bağlantı bilgilerini kullanarak SQLAlchemy URL'i oluşturur"""
    database_uri = os.getenv('DATABASE_URI', 'mysql://root:13524qwe@localhost/otel_otomasyonu_pro')

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

        user = user_pass[0]
        password = user_pass[1]
        host = host_port[0]
        port = int(host_port[1]) if len(host_port) > 1 else 3306
        database = host_port_db[1]

        # SQLAlchemy için pymysql driver URL'i
        return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

    else:
        raise ValueError("Geçersiz DATABASE_URI formatı. Beklenen: mysql://user:password@host:port/database")

# SQLAlchemy engine ve session oluştur
try:
    DATABASE_URL = get_database_url()
    engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db_session = scoped_session(SessionLocal)
    logging.info("SQLAlchemy veritabanı bağlantısı başarıyla oluşturuldu")
except Exception as e:
    logging.error(f"SQLAlchemy veritabanı bağlantı hatası: {str(e)}")
    raise

def get_db():
    """SQLAlchemy session provider"""
    db = db_session()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Tüm tabloları oluşturur (sadece geliştirme için)"""
    try:
        Base.metadata.create_all(bind=engine)
        logging.info("SQLAlchemy tabloları başarıyla oluşturuldu")
    except Exception as e:
        logging.error(f"Tablo oluşturma hatası: {str(e)}")
        raise

def drop_tables():
    """Tüm tabloları siler (sadece geliştirme için)"""
    try:
        Base.metadata.drop_all(bind=engine)
        logging.info("SQLAlchemy tabloları başarıyla silindi")
    except Exception as e:
        logging.error(f"Tablo silme hatası: {str(e)}")
        raise
