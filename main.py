import flask, database

app = flask.Flask(__name__)

@app.route("/")
def home():
    return flask.render_template("index.html")

app.run(debug=True)