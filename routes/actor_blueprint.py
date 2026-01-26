import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

actor_bp = Blueprint("actor_bp", __name__)
db = get_db()

@actor_bp.route("/api/actors", methods = ["GET"])
def get_all_actors():
    query = """  
        FOR a IN actor 
        LET movies = (
                FOR v IN 1 INBOUND a
                `movie-actor`
                RETURN v
            )
        RETURN {
        actor : a,
        movies : movies
    }
      """
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@actor_bp.route("/api/actors/active", methods = ["GET"])
def get_all_active():
    query = """  
        LET total = LENGTH(
            FOR a IN actor
                FILTER a.active == true
                RETURN 1
        )

        LET data = (
            FOR a IN actor
                FILTER a.active == true
                SORT a._key ASC
                LIMIT @offset, @page_size

                LET movies = (
                    FOR e IN `movie-actor`
                        FILTER e._to == a._id
                        LET m = DOCUMENT(e._from)  // <-- FIXED
                        FILTER m != null
                        RETURN m
                )

                RETURN {
                    actor: a,
                    movies
                }
        )

        RETURN {
            total,
            data
        }
      """
    page = int(flask.request.args.get("page", 0))
    page_size = min(int(flask.request.args.get("pageSize", 10)), 100)

    offset = page * page_size

    cursor = db.aql.execute(
        query,
        bind_vars={
            "offset": offset,
            "page_size": page_size
        })

    result = next(cursor)

    return flask.jsonify({
        "data": result["data"],
        "total": result["total"],
        "page": page,
        "pageSize": page_size
    })

@actor_bp.route("/api/actors/<path:id>", methods = ["GET"])
def get_actor_by_id(id):
    doc_id = f"actor/{id}"
    query = """
             LET d = DOCUMENT(@id)
                LET movies = (
                FOR v IN 1 INBOUND d
                `movie-actor`
                RETURN v)
                
                RETURN {actor : d , movies : movies}
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

@actor_bp.route("/api/actors/search", methods=["POST"])
def search_actors():
    query = """
            LET actorName = @actorName
            LET directorName = @directorName
            LET movieTitle = @movieTitle
            LET releaseDateStart = @releaseDateStart
            LET releaseDateEnd = @releaseDateEnd
            LET runningTimeMin = @runningTimeMin
            LET runningTimeMax = @runningTimeMax
            LET genreName = @genreName

            FOR a IN actors_view
            SEARCH actorName == null OR ANALYZER(PHRASE(a.fullName, actorName), "text_en")

            LET movies = (
                FOR m IN 1..1 INBOUND a `movie-actor`
                FILTER m.active == true
                RETURN m
            )

            FILTER (releaseDateStart == null OR 
                LENGTH(movies[* FILTER IN_RANGE(CURRENT.releaseDate, releaseDateStart, releaseDateEnd, true, true)]) > 0)
            FILTER (runningTimeMin == null OR 
                LENGTH(movies[* FILTER IN_RANGE(CURRENT.runningTime, runningTimeMin, runningTimeMax, true, true)]) > 0)

            LET directors = (
                FOR m in movies
                FOR director IN 1..1 OUTBOUND m `movie-director`
                FILTER director.active == true
                RETURN director
            )

            LET genres = (
                FOR m in movies
                FOR genre IN 1..1 OUTBOUND m `movie-genre`
                FILTER genre.active == true
                RETURN genre
            )

            FILTER directorName == null OR 
                    LENGTH(directors[* FILTER LIKE(CURRENT.fullName, CONCAT("%", directorName, "%"))]) > 0

            FILTER genreName == null OR 
                    LENGTH(genres[* FILTER CURRENT.name == genreName]) > 0

            LIMIT @offset, @limit

            RETURN {
                actor: a,
                movies: movies,
                directors: directors,
                genres: genres
            }
    """

    payload = flask.request.get_json(force=True)

    page = int(payload.get("page", 1))
    page_size = int(payload.get("pageSize", 20))
    offset = (page - 1) * page_size

    bind_vars = {
        "actorName": payload.get("actorName"),
        "movieTitle": payload.get("movieTitle"),
        "directorName": payload.get("directorName"),
        "genreName": payload.get("genreName"),
        "releaseDateStart": payload.get("releaseDateStart"),
        "releaseDateEnd": payload.get("releaseDateEnd"),
        "runningTimeMin": parse_int(payload.get("runningTimeMin")),
        "runningTimeMax": parse_int(payload.get("runningTimeMax")),
        "offset": offset,
        "limit": page_size
    }

    try:
        cursor = db.aql.execute(query, bind_vars=bind_vars)
        return flask.jsonify(list(cursor))
    except Exception as e:
        return flask.jsonify({"error": str(e)}), 500
    
def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None