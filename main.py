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

app.run(debug=True)