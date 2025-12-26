import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

mdbp = Blueprint("mdbp", __name__)
db = get_db()

@mdbp.route("/api/movie-directors", methods=["GET"])
def get_movie_directors():
    query = "FOR m IN `movie-director` RETURN m"
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@mdbp.route("/api/movie-directors/<path:id>", methods=["GET"])
def get_movie_director_by_id(id):
    doc_id = f"`movie-director`/{id}"
    query = "RETURN DOCUMENT(@id)"
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])

@mdbp.route("/api/movie-directors", methods=["POST"])
def create_movie_director():
   data = flask.request.json

   query = f"INSERT @doc INTO `movie-director` RETURN NEW"

   entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

   if not entry:
     return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
   return flask.jsonify(entry[0]),201

@mdbp.route("/api/movie-directors/<path:id>", methods=["PUT"])
def update_movie_director(id):
   if not id.startswith("`movie-director`/"):
        id = f"`movie-director`/{id}"

   data = flask.request.json
   print(f"Received JSON: {data}")
   if not data or not isinstance(data, dict):
        return flask.jsonify({"error": "No valid update data provided"}), 400

   try:
        query = "UPDATE DOCUMENT(@id) WITH @doc IN `movie-director` RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id, "doc": data}))
        return flask.jsonify(entry[0]), 200

   except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": f"Movie actor with id '{id}' not found"}), 404

@mdbp.route("/api/movie-directors/<path:id>", methods=["DELETE"])
def delete_movie_director(id):
    query = f"REMOVE @id in `movie-director` RETURN OLD"

    entry = db.aql.execute(query, bind_vars={"id" : id})

    if not entry:
        return flask.jsonify({"error" : "Error deleting entry into the database!"}, 404)
    return flask.jsonify(None)

@mdbp.route("/api/movie-directors/softDelete/<path:id>")
def soft_delete_movie_director(id):
    if not id.startswith("movie-director/"):
        id = f"`movie-director`/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))

        if not check or check[0] is None:
            return flask.jsonify({"error": f"Movie director with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN `movie-director` RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500