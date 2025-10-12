from cryptography.fernet import Fernet
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()
supabase: Client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

def insertProfessor(professor: dict):
    encryption_key = Fernet.generate_key()
    cipher = Fernet(encryption_key)

    photo_url = professor.get('photo_url')
    if photo_url:
        encrypted_photo = cipher.encrypt(photo_url.encode()).decode()
    else:
        encrypted_photo = None

    supabase.table('professores').insert({
        'encryption_key': encryption_key.decode(),
        'password': cipher.encrypt(professor['password'].encode()).decode(),
        'name': professor['name'],
        'photo_url': encrypted_photo,
        'birthdate': professor['birthdate'],
        'cpf': cipher.encrypt(professor['cpf'].encode()).decode(),
        'email': professor['email']
    }).execute()

def selectAllProfessores():
    professores = []
    for professor in supabase.table('professores').select('*').execute().data:
        cipher = Fernet(professor['encryption_key'])
        professores.append({'id': professor['id'], 
                            'password': cipher.decrypt(professor['password'].encode()).decode(),
                            'name': professor['name'],
                            'photo_url': professor['photo_url'],
                            'birthdate': professor['birthdate'],
                            'cpf': cipher.decrypt(professor['cpf'].encode()).decode(),
                            'email': professor['email']
                            })
    return(professores)

# insertProfessor({
#     'password': "1234",
#     'name': "Arthur",
#     'birthdate': "2025-11-02",
#     'cpf': "12345678901",
#     'email': "thiagoquixaba78@gmail.com"
# })