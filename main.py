# ======================================
# IMPORTS DE BIBLIOTECAS E MODULOS: 
# ======================================

import flask, database, random, resend, os
import requests
import base64
from flask import request
from cryptography.fernet import Fernet

# ======================================
# CONFIGURAÇÃO DO APP: 
# ======================================

app = flask.Flask(__name__)
from dotenv import load_dotenv
load_dotenv()
database.init_globals(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"), os.getenv('MASTER_KEY').encode())

resend.api_key = os.getenv("RESEND_API_KEY")
app.secret_key = os.getenv('SECRET_KEY')


# ======================================
# ROTAS DE PÁGINAS: 
# ======================================

# --- Rota de Login ---
@app.route('/')
def home():
    return flask.render_template('index.html')

# --- Rotas de Cadastro ---
@app.route('/cadastro/aluno')
def cadastro_aluno():
    return flask.render_template('cadastro/aluno/aluno.html')

@app.route('/cadastro/professor')
def cadastro_professor():
    return flask.render_template('cadastro/professor/professor.html')

# --- Tapa Buraco ---
@app.route('/embreve')
def embreve():
    return flask.render_template('embreve.html')


# ======================================
# FUNÇÕES DE UTILIDADE: 
# ======================================

def gerarCodigo(tamanho=6):
    '''Gera um código numérico simples para verificação por e-mail.'''
    return ''.join(str(random.randint(0, 9)) for i in range(tamanho))

def enviarCodigo(context: dict):
    '''Envia um código de verificação para o e-mail do usuário.'''
    resend.Emails.send({
        "from": "LinkedIF <noreply@linkedifpi.online>", 
        "to": context['email'],
        "subject": "Código de Verificação",
        "html": f"""
    <div style='width:100%; background-color:#f2f2f2; padding:30px 0; font-family:Arial, sans-serif;'>

        <div style='
            max-width:420px;
            margin:0 auto;
            background:#ffffff;
            padding:25px 30px;
            border-radius:10px;
            box-shadow:0 2px 8px rgba(0,0,0,0.1);
        '>

            <h2 style='
                margin:0 0 15px 0;
                font-size:22px;
                color:rgb(0,120,0);
                font-weight:bold;
                text-align:center;
            '>
                Confirmação de Cadastro
            </h2>

            <p style='font-size:15px; color:#333; text-align:center;'>
                Seu código de verificação está abaixo:
            </p>

            <div style='
                margin:20px auto;
                width:fit-content;
                background:rgb(230, 255, 230);
                border:2px solid rgb(0,120,0);
                border-radius:8px;
                padding:12px 20px;
            '>
                <span style='font-size:28px; color:#000; font-weight:bold; letter-spacing:2px;'>
                    {context['codigo']}
                </span>
            </div>

            <p style='font-size:14px; color:#555; text-align:center;'>
                Insira este código na página para concluir seu cadastro.
            </p>

            <p style='font-size:12px; color:#888; text-align:center; margin-top:25px;'>
                Caso você não tenha solicitado essa verificação, apenas ignore este e-mail.
            </p>

        </div>

    </div>
    """
    })

# ======================================
# ROTAS DE AÇÕES: 
# ======================================

# --- Rotas de Login ---
@app.route('/login', methods=['POST'])
def login():
    user = {
        'email': flask.request.form.get('email').lower(),
        'senha': flask.request.form.get('senha'),
        'tipoUsuario': flask.request.form.get('tipoUsuario')
    }

    if user['tipoUsuario'] == 'aluno':
        res = database.Alunos.search(user['email'])

    elif user['tipoUsuario'] == 'professor':
        res = database.Professores.search(user['email'])

    if res['status'] != 200:
        return flask.jsonify({'Login': False, 'body': res['body']}), res['status']

    if user['senha'] != res['body']['password']:
        return flask.jsonify({'Login': False, 'body': "Senha incorreta"}), 401

    # 🔐 LOGIN OK → SALVA NA SESSÃO
    flask.session.clear()

    if user['tipoUsuario'] == 'professor':
        flask.session["professor_id"] = res['body']['id']
        flask.session["tipo"] = "professor"

    elif user['tipoUsuario'] == 'aluno':
        flask.session["aluno_id"] = res['body']['id']
        flask.session["tipo"] = "aluno"

    return flask.jsonify({
        'Login': True,
        'type': user['tipoUsuario'],
        'user': res['body']
    }), 200



# --- Rotas de Cadastro ---
@app.route('/cadastrarAluno', methods=['POST'])
def cadastrarAluno():
    result = database.Alunos.verifyInsert(flask.request.form.get('email').lower(), flask.request.form.get('cpf'))
    if result['status'] == 200:
        aluno = {
            'name': flask.request.form.get('nome'),
            'birthdate': flask.request.form.get('dataDeNascimento'), 
            'cpf': flask.request.form.get('cpf'),
            'email': flask.request.form.get('email').lower(),
            'class': flask.request.form.get('turma'),
            'password': flask.request.form.get('senha')
        }
        codigo = gerarCodigo()
        flask.session['codigo_verificacao'] = codigo
        flask.session['aluno_temp'] = aluno

        enviarCodigo(context = {'email': aluno['email'], 'codigo': codigo})
        return flask.render_template('cadastro/aluno/confirmar.html', aluno=aluno)
    else:
        return flask.jsonify(result), result['status']

@app.route('/confirmarEmailAluno', methods=['POST'])
def confirmarEmailAluno():
    codigo = flask.request.form.get('codigo')
    aluno = flask.session.get('aluno_temp')

    if codigo != flask.session.get('codigo_verificacao'):
        return flask.jsonify({'confirm': False})

    # 1 — INSERE O ALUNO
    res = database.Alunos.insert(aluno)
    print("RESPOSTA DA INSERÇÃO DO ALUNO:", res.data)
    # 2 — PEGA O ID DIRETO DO RETORNO (SEM SEARCH)
    aluno_id = res.data[0]['id']

    # 3 — INSERE O PERFIL VAZIO (SE NÃO EXISTIR)
    database.supabase.table("perfis").insert({
        "aluno_id": aluno_id,
        "skills": "",
        "experiences": "",
        "contact": ""
    }).execute()

    return flask.jsonify({'confirm': True})

@app.route('/cadastrarProfessor', methods=['POST'])
def cadastrarProfessor():
    result = database.Professores.verifyInsert(flask.request.form.get('email').lower(), flask.request.form.get('cpf'))
    if result['status'] == 200:
        professor = {
            'name': flask.request.form.get('nome'),
            'birthdate': flask.request.form.get('dataDeNascimento'), 
            'cpf': flask.request.form.get('cpf'),
            'email': flask.request.form.get('email').lower(),
            'password': flask.request.form.get('senha')
        }
        codigo = gerarCodigo()
        flask.session['codigo_verificacao'] = codigo
        flask.session['professor_temp'] = professor

        enviarCodigo(context = {'email': professor['email'], 'codigo': codigo})
        return flask.render_template('cadastro/professor/confirmar.html', professor=professor)
    else:
        return flask.jsonify(result), result['status']

@app.route('/confirmarEmailProfessor', methods=['POST'])
def confirmarEmailProfessor():
    codigo = flask.request.form.get('codigo')

    professor = flask.session.get('professor_temp')

    if codigo == flask.session.get('codigo_verificacao'):
        database.Professores.insert(professor)
        return flask.jsonify({'confirm': True})
    else:
        return flask.jsonify({'confirm': False})



# --- Rotas de Upload Para IMGBB ---
IMGBB_KEY = os.getenv("IMGBB_KEY")

@app.route("/upload_image", methods=["POST"])
def upload_image():
    try:
        if not IMGBB_KEY:
            return flask.jsonify({
                "success": False,
                "error": "IMGBB_KEY não configurada"
            }), 500

        file = flask.request.files.get("image")

        if not file:
            return flask.jsonify({
                "success": False,
                "error": "Nenhuma imagem enviada"
            }), 400

        # Converte imagem para base64
        image_base64 = base64.b64encode(file.read()).decode("utf-8")

        url = "https://api.imgbb.com/1/upload"
        payload = {
            "key": IMGBB_KEY,
            "image": image_base64
        }

        # ENVIO CORRETO
        res = requests.post(url, data=payload)
        data = res.json()

        if res.status_code == 200 and "data" in data:
            return flask.jsonify({
                "success": True,
                "url": data["data"]["url"]
            })

        return flask.jsonify({
            "success": False,
            "error": data
        }), 500

    except Exception as e:
        return flask.jsonify({
            "success": False,
            "error": str(e)
        }), 500



# --- Rotas de Busca ---
@app.route("/buscar_projetos", methods=["GET"])
def buscar_projetos():
    termo = flask.request.args.get("termo", "").strip()

    if len(termo) < 2:
        return flask.jsonify({"projetos": []})

    res = (
        database.supabase
        .table("projetos")
        .select("id,title,description,requirements,professor_id")
        .or_(
            f"title.ilike.%{termo}%,description.ilike.%{termo}%,requirements.ilike.%{termo}%"
        )
        .execute()
    )

    projetos = []

    for p in res.data:
        prof = (
            database.supabase
            .table("professores")
            .select("name, email")
            .eq("id", p["professor_id"])
            .single()
            .execute()
            .data
        )

        projetos.append({
            "id": p["id"],
            "title": p["title"],
            "description": p["description"],
            "requirements": p["requirements"],
            "professor_nome": prof["name"],
            "professor_email": prof["email"]
        })

    return flask.jsonify({"projetos": projetos})



# --- Rotas de Atualização ---
@app.route('/atualizar_perfil', methods=['POST'])
def atualizar_perfil():
    aluno_id = flask.request.form.get("aluno_id")
    skills = flask.request.form.get("skills")
    experiences = flask.request.form.get("experiences")
    contact = flask.request.form.get("contact")
    photo_url = flask.request.form.get("photo_url")

    # Atualiza dados do perfil
    database.supabase.table("perfis").update({
        "skills": skills,
        "experiences": experiences,
        "contact": contact
    }).eq("aluno_id", aluno_id).execute()

    # Atualiza FOTO (CRIPTOGRAFADA) na tabela ALUNOS
    if photo_url:
        # Busca a chave do aluno
        aluno = (
            database.supabase
            .table("alunos")
            .select("encryption_key")
            .eq("id", aluno_id)
            .single()
            .execute()
            .data
        )

        # Descriptografa a chave
        decrypted_key = database.master_cipher.decrypt(
            aluno["encryption_key"].encode()
        )

        cipher = Fernet(decrypted_key)

        # Criptografa a URL da foto
        encrypted_photo = cipher.encrypt(photo_url.encode()).decode()

        # Atualiza no banco
        database.supabase.table("alunos").update({
            "photo_url": encrypted_photo
        }).eq("id", aluno_id).execute()

    return flask.jsonify({"update": True, "photo_url": photo_url})



# --- Rotas de Criação de Projetos ---
@app.route("/criar_projeto", methods=["POST"])
def criar_projeto():
    professor_id = int(request.form.get("professor_id"))
    description = request.form.get("description")
    requirements = request.form.get("requirements")

    # O título é a PRIMEIRA LINHA da description
    title = description.split("\n")[0].strip()

    try:
        database.supabase.table("projetos").insert({
            "professor_id": professor_id,
            "title": title,
            "description": description,
            "requirements": requirements,
            "contact": "",
            "vacancies": 1
        }).execute()

        return flask.jsonify({"success": True})

    except Exception as e:
        print("ERRO AO CRIAR:", e)
        return flask.jsonify({"success": False, "error": str(e)})

# --- Rotas de Projetos ---
@app.route("/projeto/<int:id>")
def get_projeto(id):
    try:
        res = (
            database.supabase
            .table("projetos")
            .select("*")
            .eq("id", id)
            .single()
            .execute()
        )

        if res.data:
            return flask.jsonify(res.data)

        return flask.jsonify({"error": "Projeto não encontrado"}), 404

    except Exception as e:
        return flask.jsonify({"error": str(e)}), 500
    
@app.route("/projeto/editar/<int:id>", methods=["POST"])
def editar_projeto(id):
    try:
        description = request.form.get("description")
        requirements = request.form.get("requirements")

        # Título = primeira linha da descrição
        title = description.split("\n")[0].strip()

        database.supabase.table("projetos").update({
            "title": title,
            "description": description,
            "requirements": requirements
        }).eq("id", id).execute()

        return flask.jsonify({"success": True})

    except Exception as e:
        return flask.jsonify({"success": False, "error": str(e)})

@app.route("/projeto/apagar/<int:id>", methods=["DELETE"])
def apagar_projeto(id):
    try:
        database.supabase.table("projetos").delete().eq("id", id).execute()
        return flask.jsonify({"success": True})

    except Exception as e:
        return flask.jsonify({"success": False, "error": str(e)})



@app.route('/atualizar_foto_professor', methods=['POST'])
def atualizar_foto_professor():

    professor_id = flask.session.get("professor_id")

    if not professor_id:
        return flask.jsonify({"update": False, "error": "Professor não autenticado"}), 401

    photo_url = flask.request.json.get("photo_url")

    if not photo_url:
        return flask.jsonify({"update": False, "error": "URL da foto ausente"}), 400

    # Busca a chave criptográfica do professor
    professor = (
        database.supabase
        .table("professores")
        .select("encryption_key")
        .eq("id", professor_id)
        .single()
        .execute()
        .data
    )

    # Descriptografa a chave
    decrypted_key = database.master_cipher.decrypt(
        professor["encryption_key"].encode()
    )

    cipher = Fernet(decrypted_key)

    # Criptografa a URL da foto
    encrypted_photo = cipher.encrypt(photo_url.encode()).decode()

    # Atualiza no banco
    database.supabase.table("professores").update({
        "photo_url": encrypted_photo
    }).eq("id", professor_id).execute()

    return flask.jsonify({"update": True})

# ======================================
# ROTAS DE PÁGINAS: 
# ======================================

# --- Rotas de Perfil Alunos ---
@app.route('/perfil_aluno/<int:id>')
def perfil_aluno(id):
    aluno = (
        database.supabase
        .table("alunos")
        .select("*")
        .eq("id", id)
        .single()
        .execute()
        .data
    )

    perfil = (
        database.supabase
        .table("perfis")
        .select("*")
        .eq("aluno_id", id)
        .single()
        .execute()
        .data
    )

    projetos_raw = database.supabase.table("projetos").select("*").execute().data
    projetos = []
    # 🔓 DESCRIPTOGRAFAR FOTO DO ALUNO (UMA ÚNICA VEZ)
    if aluno.get("photo_url"):
        try:
            decrypted_key = database.master_cipher.decrypt(
                aluno["encryption_key"].encode()
            )
            cipher = Fernet(decrypted_key)

            decrypted_photo = cipher.decrypt(
                aluno["photo_url"].encode()
            ).decode()

            if decrypted_photo.startswith("http"):
                aluno["photo_url"] = decrypted_photo
            else:
                aluno["photo_url"] = None

        except Exception as e:
            print("Erro ao descriptografar foto do aluno:", e)
            aluno["photo_url"] = None


    for p in projetos_raw:
        prof = (
            database.supabase
            .table("professores")
            .select("name, email, photo_url, encryption_key")
            .eq("id", p["professor_id"])
            .single()
            .execute()
            .data
        )


        # 🔐 DESCRIPTOGRAFAR FOTO DO PROFESSOR
        professor_photo = None
        if prof.get("photo_url"):
            decrypted_key = database.master_cipher.decrypt(
                prof["encryption_key"].encode()
            )
            cipher = Fernet(decrypted_key)
            professor_photo = cipher.decrypt(
                prof["photo_url"].encode()
            ).decode()

        projetos.append({
            "id": p["id"],
            "title": p["title"],
            "description": p["description"],
            "requirements": p["requirements"],
            "professor_nome": prof["name"],
            "professor_email": prof["email"],
            "professor_foto": professor_photo
        })
    

    return flask.render_template(
        "perfis/perfil_aluno.html",
        aluno=aluno,
        perfil=perfil,
        projetos=projetos
    )



# --- Home do Professor ---
@app.route('/professor/<int:id>')
def professor_home(id):

    professor = (
        database.supabase
        .table("professores")
        .select("*")
        .eq("id", id)
        .single()
        .execute()
        .data
    )

    # 🔓 DESCRIPTOGRAFAR FOTO (se existir)
    if professor.get("photo_url"):
        decrypted_key = database.master_cipher.decrypt(
            professor["encryption_key"].encode()
        )
        cipher = Fernet(decrypted_key)

        try:
            professor["photo_url"] = cipher.decrypt(
                professor["photo_url"].encode()
            ).decode()
        except:
            professor["photo_url"] = None

    projetos = (
        database.supabase
        .table("projetos")
        .select("*")
        .eq("professor_id", id)
        .order("updated_at", desc=True)
        .execute()
        .data
    )

    alunos_raw = (
        database.supabase
        .table("alunos")
        .select("id, name, class, photo_url, encryption_key")
        .execute()
        .data
    )

    alunos = []

    for aluno in alunos_raw:
        foto = None

        if aluno.get("photo_url"):
            try:
                decrypted_key = database.master_cipher.decrypt(
                    aluno["encryption_key"].encode()
                )
                cipher = Fernet(decrypted_key)

                foto = cipher.decrypt(
                    aluno["photo_url"].encode()
                ).decode()

            except Exception as e:
                print("Erro ao descriptografar foto do aluno:", e)

        alunos.append({
            "id": aluno["id"],
            "name": aluno["name"],
            "class": aluno["class"],
            "photo_url": foto
        })


    return flask.render_template(
        "perfis/perfil_professor.html",
        professor=professor,
        projetos=projetos,
        alunos=alunos
    )



# --- Rotas de Projetos ---
@app.route("/projeto/view/<int:id>")
def projeto_view(id):
    try:
        # Busca projeto
        projeto = (
            database.supabase
            .table("projetos")
            .select("*")
            .eq("id", id)
            .single()
            .execute()
            .data
        )

        if not projeto:
            return flask.jsonify({"error": "Projeto não encontrado"}), 404

        # Busca professor
        professor = (
            database.supabase
            .table("professores")
            .select("name, email, photo_url")
            .eq("id", projeto["professor_id"])
            .single()
            .execute()
            .data
        )

        return flask.jsonify({
            "success": True,
            "projeto": projeto,
            "professor": professor
        })

    except Exception as e:
        return flask.jsonify({"success": False, "error": str(e)}), 500

# ======================================
# RUN APP:
# ======================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)