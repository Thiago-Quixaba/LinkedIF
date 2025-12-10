from cryptography.fernet import Fernet
from supabase import create_client, Client
# from dotenv import load_dotenv
import os

supabase = None
master_cipher: Fernet = None

def init_globals(SUPABASE_URL, SUPABASE_KEY):
    """Inicializa as variáveis globais supabase e master_cipher."""
    global supabase, master_cipher

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY,)

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
    def search(email: str):
        try:
            res = supabase.table('professores').select('*').eq("email", email).execute()
        except:
            return {
                'status': 500,
                'body': "Erro ao consultar o banco de dados."
            }
        
        if not res.data:
            return {
                'status': 404,
                'body': "Usuário não encontrado."
            }
        
        row = res.data[0]
        
        decrypted_key = master_cipher.decrypt(row['encryption_key'].encode()).decode()
        cipher = Fernet(decrypted_key)

        return {
            'status': 200,
            'body': {
                'id': row['id'],
                'encryption_key': row['encryption_key'],
                'email': row['email'],
                'password': cipher.decrypt(row['password'].encode()).decode(),
                'created_at': row['created_at'],
                'updated_at': row['updated_at'],
                'name': row['name'],
                'birthdate': row['birthdate'],
                'cpf': cipher.decrypt(row['cpf'].encode()).decode()
            }
        }



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
    def search(email: str):
        try:
            res = supabase.table('alunos').select('*').eq("email", email).execute()
        except:
            return {
                'status': 500,
                'body': "Erro ao consultar o banco de dados."
            }
        
        if not res.data:
            return {
                'status': 404,
                'body': "Usuário não encontrado."
            }
        
        row = res.data[0]
        
        decrypted_key = master_cipher.decrypt(row['encryption_key'].encode()).decode()
        cipher = Fernet(decrypted_key)

        return {
            'status': 200,
            'body': {
                'id': row['id'],
                'encryption_key': row['encryption_key'],
                'email': row['email'],
                'password': cipher.decrypt(row['password'].encode()).decode(),
                'created_at': row['created_at'],
                'updated_at': row['updated_at'],
                'name': row['name'],
                'birthdate': row['birthdate'],
                'cpf': cipher.decrypt(row['cpf'].encode()).decode(),
                'class': row['class']
            }
        }