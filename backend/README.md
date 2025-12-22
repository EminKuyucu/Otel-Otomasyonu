# Otel Otomasyonu Backend

Python + Flask + SQLAlchemy ile geliştirilmiş backend API.

## Kurulum

1. Python virtual environment oluşturun:
```bash
python -m venv venv
```

2. Virtual environment'ı aktifleştirin:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Bağımlılıkları yükleyin:
```bash
pip install -r requirements.txt
```

4. `.env` dosyası oluşturun ve veritabanı bağlantı bilgilerinizi girin:
```
DATABASE_URI=mysql+pymysql://root:password@localhost/otel_otomasyonu_pro
SECRET_KEY=your-secret-key-here
```

5. Uygulamayı çalıştırın:
```bash
python app.py
```

API `http://localhost:5000` adresinde çalışacaktır.














