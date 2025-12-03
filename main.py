import flask, database

app = flask.Flask(__name__)

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
    return flask.render_template("cadastro/aluno.html")

@app.route("/cadastro/professor")
def cadastro_professor():
    return flask.render_template("cadastro/professor.html")

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
    
    database.Alunos.insert(aluno)
    return flask.redirect("/")

@app.route("/cadastrarProfessor", methods=["POST"])
def cadastrarProfessor():
    professor = {
        'name': flask.request.form.get("nome"),
        'birthdate': flask.request.form.get("dataDeNascimento"), 
        'cpf': flask.request.form.get("cpf"),
        'email': flask.request.form.get("email"),
        'password': flask.request.form.get("senha")
    }
    
    database.Professores.insert(professor)
    return flask.redirect("/")

if __name__ == "__main__":
    app.run(debug=True)
