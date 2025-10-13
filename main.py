import flask, database

app = flask.Flask(__name__)

@app.route("/")
def home():
    return flask.render_template("index.html")
#|-----------------Cadastro-------------------|
@app.route("/cadastro")
def cadastro():
    return flask.render_template("cadastro.html")

#|--------------Cadastro Aluno----------------|

@app.route("/cadastro/aluno")
def cadastro_aluno():
    return flask.render_template("cadastro/aluno.html")

@app.route("/cadastrarAluno", methods=["POST"])
def cadastrarAluno():
    aluno = {
        'name': flask.request.form.get("name"),
        'birthdate': flask.request.form.get("birthdate"), 
        'cpf': flask.request.form.get("cpf"),
        'email': flask.request.form.get("email"),
        'course': flask.request.form.get("course"),
        'class': flask.request.form.get("class"),
        'password': flask.request.form.get("password")
        }


    database.Alunos.insert(aluno)

    return flask.redirect("/")

#|-------------Cadastro Professor---------------|

@app.route("/cadastro/professor")
def cadastro_professor():
    return flask.render_template("cadastro/professor.html")

@app.route("/cadastrarProfessor", methods=["POST"])
def cadastrarProfessor():
    professor = {
        'name': flask.request.form.get("name"),
        'birthdate': flask.request.form.get("birthdate"), 
        'cpf': flask.request.form.get("cpf"),
        'email': flask.request.form.get("email"),
        'password': flask.request.form.get("password")
        }


    database.Professores.insert(professor)

    return flask.redirect("/")

app.run(debug=True)