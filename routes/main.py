import os
import flask
from flask import Flask
from flask_cors import CORS

from movie_blueprint import movie_bp
from actor_blueprint import actor_bp
from director_blueprint import director_bp
from genre_blueprint import genre_bp
from movie_actor_blueprint import mabp
from movie_director_blueprint import mdbp
from movie_genre_blueprint import mgbp
from user_movie_blueprint import umbp
from user_blueprint import ubp
from login import login_bp


BASE_DIR = os.path.abspath(os.path.dirname(__file__))

STATIC_PATH = os.path.join(
    BASE_DIR,
    "../frontend/frontend/dist/frontend/browser"
)

app = Flask(
    __name__,
    static_folder=STATIC_PATH,
    static_url_path=""
)

CORS(app)

app.register_blueprint(movie_bp)
app.register_blueprint(actor_bp)
app.register_blueprint(director_bp)
app.register_blueprint(genre_bp)
app.register_blueprint(mabp)
app.register_blueprint(mdbp)
app.register_blueprint(mgbp)
app.register_blueprint(umbp)
app.register_blueprint(ubp)
app.register_blueprint(login_bp)

@app.route("/")
def index():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(debug=True)

    for rule in app.url_map.iter_rules():
        print(f"{rule} → {rule.methods}")