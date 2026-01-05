import database, os
from dotenv import load_dotenv
load_dotenv()
database.init_globals(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"), os.getenv('MASTER_KEY').encode())

print(database.Alunos.search("capau.2023120iipi0028@aluno.ifpi.edu.br"))