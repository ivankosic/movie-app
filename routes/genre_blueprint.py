import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

genre_bp = Blueprint("genre_bp", __name__)
db = get_db()

@genre_bp.route("/api/genres", methods = ["GET"])
def get_all_genres():
    query = "FOR g IN genre RETURN g"
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@genre_bp.route("/api/genres/<path:id>", methods = ["GET"])
def get_genre_by_id(id):
    doc_id = f"genre/{id}"
    query = "RETURN DOCUMENT(@id)"
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])

@genre_bp.route("/api/genres", methods = ["POST"])
def create_genre():
    data = flask.request.json

    query = f"INSERT @doc INTO genre RETURN NEW"

    entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

    if not entry:
        return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
    return flask.jsonify(entry[0]),201

@genre_bp.route("/api/genres/<path:id>", methods = ["PUT"])
def update_genre(id):
    if not id.startswith("genre/"):
        id = f"genre/{id}"

    data = flask.request.json
    print(f"Received JSON: {data}")
    if not data or not isinstance(data, dict):
        return flask.jsonify({"error": "No valid update data provided"}), 400

    try:
        query = "UPDATE DOCUMENT(@id) WITH @doc IN director RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id, "doc": data}))
        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": f"Genre with id '{id}' not found"}), 404

@genre_bp.route("/api/genres/<path:id>")
def delete_genre(id):
    if not id.startswith("genre/"):
        id = f"genre/{id}"

    try:
        delete_query = "REMOVE DOCUMENT(@id) IN genre RETURN OLD"
        entry = list(db.aql.execute(delete_query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during deletion"}), 500
    
@genre_bp.route("/api/genres/softDelete/<path:id>")
def soft_delete_genre(id):
    if not id.startswith("genre/"):
        id = f"genre/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))

        if not check or check[0] is None:
            return flask.jsonify({"error": f"Genre with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN genre RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500

@genre_bp.route("/api/genres/search", methods=["GET"])
def search_genres():
    term = flask.request.args.get("term", "")

    query = """
        FOR g IN genre
            FILTER CONTAINS(LOWER(g.name), LOWER(@term))
            RETURN g
    """

    cursor = db.aql.execute(query, bind_vars={"term": term})
    data = list(cursor)
    return flask.jsonify(data if data else {"message": "No data to fetch"})
