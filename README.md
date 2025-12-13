# Otel Otomasyonu Projesi

Tam yığın (Full-Stack) otel otomasyon sistemi.

## Proje Yapısı

```
otel-otomasyonu/
├── backend/          # Python + Flask backend
│   ├── app/         # Ana uygulama klasörü
│   ├── models/      # SQLAlchemy modelleri
│   ├── routes/      # API route'ları
│   ├── services/    # İş mantığı servisleri
│   ├── database.py  # Veritabanı konfigürasyonu
│   └── app.py       # Ana uygulama dosyası
│
└── frontend/        # React + Vite frontend
    ├── src/
    │   ├── pages/      # Sayfa bileşenleri
    │   ├── components/ # Yeniden kullanılabilir bileşenler
    │   ├── layout/     # Layout bileşenleri
    │   └── services/   # API servisleri
    └── package.json
```

## Teknolojiler

### Backend
- Python 3.x
- Flask
- SQLAlchemy (ORM)
- MySQL
- Flask-CORS

### Frontend
- React 18
- Vite
- TailwindCSS
- React Router
- Axios

## Kurulum

### Backend Kurulumu

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

`.env` dosyası oluşturun:
```
DATABASE_URI=mysql+pymysql://root:password@localhost/otel_otomasyonu_pro
SECRET_KEY=your-secret-key-here
```

### Frontend Kurulumu

```bash
cd frontend
npm install
```

## Çalıştırma

### Backend
```bash
cd backend
python app.py
```
Backend `http://localhost:5000` adresinde çalışır.

### Frontend
```bash
cd frontend
npm run dev
```
Frontend `http://localhost:3000` adresinde çalışır.

## Veritabanı

MySQL veritabanı şeması proje kök dizinindeki SQL dosyasında bulunmaktadır. Veritabanını oluşturmak için SQL dosyasını MySQL'de çalıştırın.

## API Endpoints

- `/api/personel` - Personel yönetimi
- `/api/musteri` - Müşteri yönetimi
- `/api/oda` - Oda yönetimi
- `/api/rezervasyon` - Rezervasyon yönetimi
- `/api/odeme` - Ödeme yönetimi
- `/api/hizmet` - Hizmet yönetimi




