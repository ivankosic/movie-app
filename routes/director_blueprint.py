import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

director_bp = Blueprint("director_bp", __name__)
db = get_db()

@director_bp.route("/api/directors", methods = ["GET"])
def get_all_directors():
    query = "FOR d IN director RETURN d"
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@director_bp.route("/api/directors/<path:id>", methods = ["GET"])
def get_director_by_id(id):
    doc_id = f"director/{id}"
    query = """
                LET d = DOCUMENT(@id)
                LET movies = (
                    FOR e IN `movie-director`
                        FILTER e._to == d._id
                        LET m = DOCUMENT(e._from)
                        FILTER m != null
                        RETURN { movie: m }
                )

                RETURN {
                    director: d,
                    movies : movies
                }
            """
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])

@director_bp.route("/api/directors", methods = ["POST"])
def create_director():
    data = flask.request.json

    query = f"INSERT @doc INTO director RETURN NEW"

    entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

    if not entry:
        return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
    return flask.jsonify(entry[0]),201

@director_bp.route("/api/directors/<path:id>", methods = ["PUT"])
def update_director(id):
    if not id.startswith("director/"):
        id = f"director/{id}"

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
        return flask.jsonify({"error": f"Director with id '{id}' not found"}), 404

@director_bp.route("/api/directors/<path:id>")
def delete_director(id):
    if not id.startswith("director/"):
        id = f"director/{id}"

    try:
        delete_query = "REMOVE DOCUMENT(@id) IN director RETURN OLD"
        entry = list(db.aql.execute(delete_query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during deletion"}), 500

@director_bp.route("/api/directors/softDelete/<path:id>")
def soft_delete_director(id):
    if not id.startswith("director/"):
        id = f"director/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))

        if not check or check[0] is None:
            return flask.jsonify({"error": f"Director with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN director RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500

@director_bp.route("/api/directors/search", methods=["GET"])
def search_directors():
    term = flask.request.args.get("term", "")
    query = """
        FOR d IN director
            FILTER CONTAINS(LOWER(d.fullName), LOWER(@term)) OR
                   CONTAINS(LOWER(TO_STRING(d.dateOfBirth)), LOWER(@term)) OR
                   CONTAINS(LOWER(TO_STRING(d.dateOfDeath)), LOWER(@term)) OR
                   CONTAINS(LOWER(TO_STRING(d.age)), LOWER(@term)) OR
                   CONTAINS(LOWER(d.imageUrl), LOWER(@term))
            RETURN {
                _key: d._key,
                fullName: d.fullName,
                dateOfBirth: d.dateOfBirth,
                dateOfDeath: d.dateOfDeath,
                age: d.age,
                imageUrl: d.imageUrl
            }
    """
    cursor = db.aql.execute(query, bind_vars={"term": term})
    data = list(cursor)
    return flask.jsonify(data if data else {"message": "No data to fetch"})

