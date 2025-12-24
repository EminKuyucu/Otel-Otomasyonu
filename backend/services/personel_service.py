from models import Personel
from database import db

class PersonelService:
    @staticmethod
    def get_all():
        return Personel.query.all()
    
    @staticmethod
    def get_by_id(personel_id):
        return Personel.query.get(personel_id)
    
    @staticmethod
    def create(data):
        personel = Personel(**data)
        db.session.add(personel)
        db.session.commit()
        return personel
    
    @staticmethod
    def update(personel_id, data):
        personel = Personel.query.get_or_404(personel_id)
        for key, value in data.items():
            setattr(personel, key, value)
        db.session.commit()
        return personel
    
    @staticmethod
    def delete(personel_id):
        personel = Personel.query.get_or_404(personel_id)
        db.session.delete(personel)
        db.session.commit()
        return True















