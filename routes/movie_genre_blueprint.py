import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

mgbp = Blueprint("mgbp", __name__)
db = get_db()

@mgbp.route("/api/movie-genres", methods=["GET"])
def get_movie_genre():
    query = "FOR m IN `movie-genre` RETURN m"
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@mgbp.route("/api/movie-genres/<id>", methods=["GET"])
def get_movie_genre_by_id(id):
    doc_id = f"`movie-genre`/{id}"
    query = "RETURN DOCUMENT(@id)"
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])

@mgbp.route("/api/movie-genres", methods=["POST"])
def create_movie_actor():
   data = flask.request.json

   query = f"INSERT @doc INTO `movie-genre` RETURN NEW"

   entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

   if not entry:
     return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
   return flask.jsonify(entry[0]),201

@mgbp.route("/api/movie-genres/<path:id>", methods=["PUT"])
def update_movie_genre(id):
   if not id.startswith("`movie-actor`/"):
        id = f"`movie-genre`/{id}"

   data = flask.request.json
   print(f"Received JSON: {data}")
   if not data or not isinstance(data, dict):
        return flask.jsonify({"error": "No valid update data provided"}), 400

   try:
        query = "UPDATE DOCUMENT(@id) WITH @doc IN `movie-actor` RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id, "doc": data}))
        return flask.jsonify(entry[0]), 200

   except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": f"Genre with id '{id}' not found"}), 404

@mgbp.route("/api/movie-genres/<path:id>", methods=["DELETE"])
def delete_movie_actor(id):
    query = f"REMOVE @id in `movie-genre`"

    entry = db.aql.execute(query, bind_vars={"id" : id})

    if not entry:
        return flask.jsonify({"error" : "Error deleting entry into the database!"}, 404)
    return flask.jsonify(None)

@mgbp.route("/api/movie-genres/softDelete/<path:id>")
def soft_delete_genre(id):
    if not id.startswith("movie-genre/"):
        id = f"`movie-genre`/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))

        if not check or check[0] is None:
            return flask.jsonify({"error": f"Movie actor with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN `movie-genre` RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500