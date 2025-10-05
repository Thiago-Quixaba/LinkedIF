import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

def selectAll():
    alunos = supabase.table("alunos").select("*").execute()
    
    if alunos.data:
        return alunos.data
    else:
        return []

def insert(aluno: dict):
    supabase.table("alunos").insert({
        "name": aluno['name'],
        "birthdate": aluno['birthdate'],
        "cpf": aluno['cpf'],
        "email": aluno['email'],
        "curso": aluno['curso'],
        "turma": aluno['turma'],
        "senha": aluno['senha']
    }).execute()