import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

actor_bp = Blueprint("actor_bp", __name__)
db = get_db()

@actor_bp.route("/api/actors", methods = ["GET"])
def get_all_actors():
    query = "FOR a IN actor RETURN a"
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@actor_bp.route("/api/actors/<path:id>", methods = ["GET"])
def get_actor_by_id(id):
    doc_id = f"actor/{id}"
    query = """
                    LET d = DOCUMENT(@id)
                    LET movies = (
                        FOR e IN `movie-actor`
                            FILTER e._to == d._id
                            LET m = DOCUMENT(e._from)
                            FILTER m != null
                            RETURN { movie: m }
                    )

                    RETURN {
                        actor: d,
                        movies : movies
                    }
                """
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])

@actor_bp.route("/api/actors", methods = ["POST"])
def create_actor():
  data = flask.request.json

  query = f"INSERT @doc INTO actor RETURN NEW"

  entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

  if not entry:
    return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
  return flask.jsonify(entry[0]),201

@actor_bp.route("/api/actors/<path:id>", methods = ["PUT"])
def update_actor(id):
    if not id.startswith("actor/"):
        id = f"actor/{id}"

    data = flask.request.json
    print(f"Received JSON: {data}")
    if not data or not isinstance(data, dict):
        return flask.jsonify({"error": "No valid update data provided"}), 400

    try:
        query = "UPDATE DOCUMENT(@id) WITH @doc IN actor RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id, "doc": data}))
        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": f"Actor with id '{id}' not found"}), 404

@actor_bp.route("/api/actors/<path:id>")
def delete_actor(id):
    if not id.startswith("actor/"):
        id = f"actor/{id}"

    try:
        delete_query = "REMOVE DOCUMENT(@id) IN actor RETURN OLD"
        entry = list(db.aql.execute(delete_query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during deletion"}), 500
    
@actor_bp.route("/api/actors/softDelete/<path:id>")
def soft_delete_actor(id):
    if not id.startswith("actor/"):
        id = f"actor/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))
        if not check or check[0] is None:
            return flask.jsonify({"error": f"Actor with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN actor RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500

@actor_bp.route("/api/actors/search", methods=["GET"])
def search_actors():
    term = flask.request.args.get("term", "")

    query = """
        FOR a IN actor
            FILTER
                CONTAINS(LOWER(a.fullName), LOWER(@term)) OR
                CONTAINS(LOWER(a.description), LOWER(@term)) OR
                CONTAINS(LOWER(TO_STRING(a.dateOfBirth)), LOWER(@term)) OR
                CONTAINS(LOWER(TO_STRING(a.dateOfDeath)), LOWER(@term)) OR
                CONTAINS(TO_STRING(a.age), @term) OR
                CONTAINS(LOWER(a.imageUrl), LOWER(@term))
            RETURN {
                _key: a._key,
                fullName: a.fullName,
                description: a.description,
                dateOfBirth: a.dateOfBirth,
                dateOfDeath: a.dateOfDeath,
                age: a.age,
                imageUrl: a.imageUrl
            }
    """

    cursor = db.aql.execute(query, bind_vars={"term": term})
    data = list(cursor)
    return flask.jsonify(data if data else {"message": "No data to fetch"})