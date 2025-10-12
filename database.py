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

def insertAluno(aluno: dict):
    encryption_key = Fernet.generate_key()
    cipher = Fernet(encryption_key)

    photo_url = aluno.get('photo_url')
    if photo_url:
        encrypted_photo = cipher.encrypt(photo_url.encode()).decode()
    else:
        encrypted_photo = None

    supabase.table('alunos').insert({
        'encryption_key': encryption_key.decode(),
        'password': cipher.encrypt(aluno['password'].encode()).decode(),
        'name': aluno['name'],
        'photo_url': encrypted_photo,
        'birthdate': aluno['birthdate'],
        'cpf': cipher.encrypt(aluno['cpf'].encode()).decode(),
        'email': aluno['email'],
        'course': aluno.get['course'],  
        'class': aluno.get['class']           
    }).execute()


def selectAllAlunos():
    alunos = []
    for aluno in supabase.table('alunos').select('*').execute().data:
        cipher = Fernet(aluno['encryption_key'])
        alunos.append({
            'id': aluno['id'],
            'password': cipher.decrypt(aluno['password'].encode()).decode(),
            'name': aluno['name'],
            'photo_url': aluno['photo_url'],
            'birthdate': aluno['birthdate'],
            'cpf': cipher.decrypt(aluno['cpf'].encode()).decode(),
            'email': aluno['email'],
            'course': aluno.get['course'],
            'class': aluno.get['class']
        })
    return alunos


# insertProfessor({
#     'password': "1234",
#     'name': "Arthur",
#     'birthdate': "2025-11-02",
#     'cpf': "12345678901",
#     'email': "thiagoquixaba78@gmail.com"
# })

#--------------------------------------------

#insertAluno({
#    'password': "1234",
#    'name': "Livia",
#    'birthdate': "2025-11-02",
#    'cpf': "12345678901",
#    'email': "lili908@gmail.com",
#    'course': "Informatica",
#    'class': "3º"
#})