import flask, database

app = flask.Flask(__name__)

@app.route("/")
def home():
    return flask.render_template("index.html")

@app.route("/alunos")
def alunos():
    alunos = database.selectAll()
    return flask.render_template("alunos.html", alunos=alunos)

@app.route("/cadastro")
def cadastro():
    return flask.render_template("cadastro.html")

@app.route("/cadastrar", methods=["POST"])
def cadastrar():
    aluno = {
        'name': flask.request.form.get("name"),
        'birthdate': flask.request.form.get("birthdate"), 
        'cpf': flask.request.form.get("cpf"),
        'email': flask.request.form.get("email"),
        'curso': flask.request.form.get("curso"),
        'turma': flask.request.form.get("turma"),
        'senha': flask.request.form.get("senha")
        }

    database.insert(aluno)

    return flask.redirect("/")

app.run(debug=True)