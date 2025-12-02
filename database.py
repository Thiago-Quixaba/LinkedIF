from cryptography.fernet import Fernet
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()
supabase: Client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
master_cipher = Fernet(os.getenv('MASTER_KEY').encode())

class Professores():
    @staticmethod
    def insert(professor: dict):
        encryption_key = Fernet.generate_key()
        cipher = Fernet(encryption_key)

        photo_url = professor.get('photo_url')
        if photo_url:
            encrypted_photo = cipher.encrypt(photo_url.encode()).decode()
        else:
            encrypted_photo = None

        supabase.table('professores').insert({
            'encryption_key': master_cipher.encrypt(encryption_key).decode(),
            'password': cipher.encrypt(professor['password'].encode()).decode(),
            'name': professor['name'],
            'photo_url': encrypted_photo,
            'birthdate': professor['birthdate'],
            'cpf': cipher.encrypt(professor['cpf'].encode()).decode(),
            'email': professor['email']
        }).execute()


    @staticmethod
    def selectAll():
        professores = []
        for professor in supabase.table('professores').select('*').execute().data:
            cipher = Fernet(master_cipher.decrypt(professor['encryption_key'].encode()).decode())
            if professor['photo_url']:
                decrypted_photo = cipher.decrypt(professor['photo_url'].encode()).decode()
            else:
                decrypted_photo = None
            professores.append({'id': professor['id'], 
                                'password': cipher.decrypt(professor['password'].encode()).decode(),
                                'name': professor['name'],
                                'photo_url': decrypted_photo,
                                'birthdate': professor['birthdate'],
                                'cpf': cipher.decrypt(professor['cpf'].encode()).decode(),
                                'email': professor['email']
                                })
        return(professores)

class Alunos():
    @staticmethod
    def insert(aluno: dict):
        encryption_key = Fernet.generate_key()
        cipher = Fernet(encryption_key)

        photo_url = aluno.get('photo_url')
        if photo_url:
            encrypted_photo = cipher.encrypt(photo_url.encode()).decode()
        else:
            encrypted_photo = None

        supabase.table('alunos').insert({
            'encryption_key': master_cipher.encrypt(encryption_key).decode(),
            'password': cipher.encrypt(aluno['password'].encode()).decode(),
            'name': aluno['name'],
            'photo_url': encrypted_photo,
            'birthdate': aluno['birthdate'],
            'cpf': cipher.encrypt(aluno['cpf'].encode()).decode(),
            'email': aluno['email'],
            'class': aluno['class']        
        }).execute()

    @staticmethod
    def selectAll():
        alunos = []
        for aluno in supabase.table('alunos').select('*').execute().data:
            cipher = Fernet(master_cipher.decrypt(aluno['encryption_key'].encode()).decode())
            if aluno['photo_url']:
                decrypted_photo = cipher.decrypt(aluno['photo_url'].encode()).decode()
            else:
                decrypted_photo = None
            alunos.append({
                'id': aluno['id'],
                'password': cipher.decrypt(aluno['password'].encode()).decode(),
                'name': aluno['name'],
                'photo_url': decrypted_photo,
                'birthdate': aluno['birthdate'],
                'cpf': cipher.decrypt(aluno['cpf'].encode()).decode(),
                'email': aluno['email'],
                'class': aluno['class']
            })
        return alunos