import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

umbp = Blueprint("umbp", __name__)
db = get_db()

@umbp.route("/api/user-movies", methods=["GET"])
def get_user_movies():
    query = "FOR m IN `user-movie` RETURN m"
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@umbp.route("/api/user-movies/active", methods=["GET"])
def get_all_active():
    query = """FOR m IN `user-movie`
                FILTER m.active == true
                 RETURN m"""
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@umbp.route("/api/user-movies/<path:id>", methods=["GET"])
def get_user_movie_by_id(id):
    doc_id = f"`user-movie`/{id}"
    query = "RETURN DOCUMENT(@id)"
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])

@umbp.route("/api/user-movies", methods=["POST"])
def create_user_movie():
   data = flask.request.json

   query = f"INSERT @doc INTO `user-movie` RETURN NEW"

   entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

   if not entry:
     return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
   return flask.jsonify(entry[0]),201

@umbp.route("/api/user-movies/<path:id>", methods=["PUT"])
def update_user_movie(id):
   if not id.startswith("`user-movie`/"):
        id = f"`user-movie`/{id}"

   data = flask.request.json
   print(f"Received JSON: {data}")
   if not data or not isinstance(data, dict):
        return flask.jsonify({"error": "No valid update data provided"}), 400

   try:
        query = "UPDATE DOCUMENT(@id) WITH @doc IN `user-movie` RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id, "doc": data}))
        return flask.jsonify(entry[0]), 200

   except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": f"Genre with id '{id}' not found"}), 404

@umbp.route("/api/user-movies/<path:id>", methods=["DELETE"])
def delete_user_movie(id):
    query = f"REMOVE @id in `user-movie`"

    entry = db.aql.execute(query, bind_vars={"id" : id})

    if not entry:
        return flask.jsonify({"error" : "Error deleting entry into the database!"}, 404)
    return flask.jsonify(None)

@umbp.route("/api/user-movies/softDelete/<path:id>")
def soft_delete_user_movie(id):
    if not id.startswith("user-movie/"):
        id = f"`user-movie`/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))

        if not check or check[0] is None:
            return flask.jsonify({"error": f"User movie with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN `user-movie` RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500