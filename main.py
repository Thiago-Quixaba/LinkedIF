# ======================================
# IMPORTS DE BIBLIOTECAS E MODULOS: 
# ======================================

import flask, database, random, resend, os

# ======================================
# CONFIGURAÇÃO DO APP: 
# ======================================

app = flask.Flask(__name__)
# from dotenv import load_dotenv
# load_dotenv()
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
    
    if res['status'] == 200:
        if user['senha'] == res['body']['password']:
            return flask.jsonify({'Login': True, 'type': user['tipoUsuario'], 'user': res['body']}), 200
        else:
            return flask.jsonify({'Login': False, 'body': "Senha Incorreta!"}), 401
    else:
        return flask.jsonify({'Login': False, 'body': res['body']}), res['status']



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

    if codigo == flask.session.get('codigo_verificacao'):
        database.Alunos.insert(aluno)
        return flask.jsonify({'confirm': True})
    else:
        return flask.jsonify({'confirm': False})

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


# ======================================
# RUN APP:
# ======================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)