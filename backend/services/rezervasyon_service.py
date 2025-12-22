from models import Rezervasyon
from database import db

class RezervasyonService:
    @staticmethod
    def get_all():
        return Rezervasyon.query.all()
    
    @staticmethod
    def get_by_id(rezervasyon_id):
        return Rezervasyon.query.get(rezervasyon_id)
    
    @staticmethod
    def create(data):
        rezervasyon = Rezervasyon(**data)
        db.session.add(rezervasyon)
        db.session.commit()
        return rezervasyon
    
    @staticmethod
    def update(rezervasyon_id, data):
        rezervasyon = Rezervasyon.query.get_or_404(rezervasyon_id)
        for key, value in data.items():
            setattr(rezervasyon, key, value)
        db.session.commit()
        return rezervasyon
    
    @staticmethod
    def delete(rezervasyon_id):
        rezervasyon = Rezervasyon.query.get_or_404(rezervasyon_id)
        db.session.delete(rezervasyon)
        db.session.commit()
        return True














