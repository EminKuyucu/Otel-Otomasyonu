from models import Musteri
from database import db

class MusteriService:
    @staticmethod
    def get_all():
        return Musteri.query.all()
    
    @staticmethod
    def get_by_id(musteri_id):
        return Musteri.query.get(musteri_id)
    
    @staticmethod
    def create(data):
        musteri = Musteri(**data)
        db.session.add(musteri)
        db.session.commit()
        return musteri
    
    @staticmethod
    def update(musteri_id, data):
        musteri = Musteri.query.get_or_404(musteri_id)
        for key, value in data.items():
            setattr(musteri, key, value)
        db.session.commit()
        return musteri
    
    @staticmethod
    def delete(musteri_id):
        musteri = Musteri.query.get_or_404(musteri_id)
        db.session.delete(musteri)
        db.session.commit()
        return True











