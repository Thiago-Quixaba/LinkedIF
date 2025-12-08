import flask, database, random
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os

app = flask.Flask(__name__)
load_dotenv()

app.secret_key = os.getenv('SECRET_KEY')
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "linkedifpi@gmail.com"
app.config["MAIL_PASSWORD"] = "hjgm wmgz ueuf xnvj "

mail = Mail(app)

@app.route("/")
def home():
    return flask.render_template("index.html")

@app.route('/login', methods=['POST'])
def login():
    email = flask.request.form.get('email')
    senha = flask.request.form.get('senha')
    tipo_usuario = flask.request.form.get('tipoUsuario')
    return "OK", 200

@app.route("/cadastro/aluno")
def cadastro_aluno():
    return flask.render_template("cadastro/aluno/aluno.html")

@app.route("/cadastro/professor")
def cadastro_professor():
    return flask.render_template("cadastro/professor/professor.html")

def gerarCodigo(tamanho=6):
    return ''.join(str(random.randint(0, 9)) for i in range(tamanho))

def enviarCodigo(context: dict):
    msg = Message(
        subject="Código de verificação",
        sender=app.config["MAIL_USERNAME"],
        recipients=[context['email']]
    )

    msg.html = f"""
        <p>Seu código de verificação é:</p>
        <h2 style="font-size: 28px; font-weight: bold; color: #000;">
            {context['codigo']}
        </h2>
        <p>Use-o para concluir seu cadastro.</p>
    """

    mail.send(msg)

@app.route("/cadastrarAluno", methods=["POST"])
def cadastrarAluno():
    aluno = {
        'name': flask.request.form.get("nome"),
        'birthdate': flask.request.form.get("dataDeNascimento"), 
        'cpf': flask.request.form.get("cpf"),
        'email': flask.request.form.get("email"),
        'class': flask.request.form.get("turma"),
        'password': flask.request.form.get("senha")
    }
    codigo = gerarCodigo()
    flask.session["codigo_verificacao"] = codigo
    flask.session["aluno_temp"] = aluno

    enviarCodigo(context = {'email': aluno['email'], 'codigo': codigo})
    return flask.render_template("cadastro/aluno/confirmar.html", aluno=aluno)

@app.route("/confirmarEmailAluno", methods=["POST"])
def confirmarEmailAluno():
    codigo = flask.request.form.get("codigo")

    aluno = flask.session.get("aluno_temp")

    if codigo == flask.session.get("codigo_verificacao"):
        database.Alunos.insert(aluno)
        return flask.jsonify({"confirm": True})
    else:
        return flask.jsonify({"confirm": False})

@app.route("/cadastrarProfessor", methods=["POST"])
def cadastrarProfessor():
    professor = {
        'name': flask.request.form.get("nome"),
        'birthdate': flask.request.form.get("dataDeNascimento"), 
        'cpf': flask.request.form.get("cpf"),
        'email': flask.request.form.get("email"),
        'password': flask.request.form.get("senha")
    }
    codigo = gerarCodigo()
    flask.session["codigo_verificacao"] = codigo
    flask.session["professor_temp"] = professor

    enviarCodigo(context = {'email': professor['email'], 'codigo': codigo})
    return flask.render_template("cadastro/professor/confirmar.html", professor=professor)

@app.route("/confirmarEmailProfessor", methods=["POST"])
def confirmarEmailProfessor():
    codigo = flask.request.form.get("codigo")

    professor = flask.session.get("professor_temp")

    if codigo == flask.session.get("codigo_verificacao"):
        database.Professores.insert(professor)
        return flask.jsonify({"confirm": True})
    else:
        return flask.jsonify({"confirm": False})

if __name__ == "__main__":
    app.run(debug=True)