import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

director_bp = Blueprint("director_bp", __name__)
db = get_db()

@director_bp.route("/api/directors", methods = ["GET"])
def get_all_directors():
    query = """  
        FOR d IN director 
        LET movies = (
                FOR v IN 1 INBOUND d
                `movie-director`
                RETURN v
            )
        RETURN {
        director : d,
        movies : movies
    }
      """
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})

@director_bp.route("/api/directors/active", methods = ["GET"])
def get_all_active():
    query = """  
        LET total = LENGTH(
            FOR a IN director
                FILTER a.active == true
                RETURN 1
            )

            LET data = (
            FOR d IN director
                FILTER d.active == true
                SORT d._key ASC
                LIMIT @offset, @page_size

                LET movies = (
                FOR e IN `movie-director`
                    FILTER e._to == d._id
                    LET m = DOCUMENT(e._to)
                    FILTER m != null
                    RETURN m
                )

                RETURN {
                director: d,
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

@director_bp.route("/api/directors/<path:id>", methods = ["GET"])
def get_director_by_id(id):
    doc_id = f"director/{id}"
    query = """
                LET d = DOCUMENT(@id)
                LET movies = (
                FOR v IN 1 INBOUND d
                `movie-director`
                RETURN v)
                
                RETURN {director : d , movies : movies}
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
    # term = flask.request.args.get("term", "")
    # query = """
    #     FOR d IN director
    #         FILTER CONTAINS(LOWER(d.fullName), LOWER(@term)) OR
    #                CONTAINS(LOWER(TO_STRING(d.dateOfBirth)), LOWER(@term)) OR
    #                CONTAINS(LOWER(TO_STRING(d.dateOfDeath)), LOWER(@term)) OR
    #                CONTAINS(LOWER(TO_STRING(d.age)), LOWER(@term)) OR
    #                CONTAINS(LOWER(d.imageUrl), LOWER(@term))
    #         RETURN {
    #             _key: d._key,
    #             fullName: d.fullName,
    #             dateOfBirth: d.dateOfBirth,
    #             dateOfDeath: d.dateOfDeath,
    #             age: d.age,
    #             imageUrl: d.imageUrl
    #         }
    # """
    # cursor = db.aql.execute(query, bind_vars={"term": term})
    # data = list(cursor)
    # return flask.jsonify(data if data else {"message": "No data to fetch"})
#     page = int(flask.request.args.get("page", 1))
#     page_size = int(flask.request.args.get("pageSize", 20))

#     query = """
#         LET actorMovieKeys = (
#         @actorName == null ? [] :
#         (
#             FOR a IN actors_view
#             SEARCH ANALYZER(
#             PHRASE(a.fullName, @actorName),
#             "text_en"
#         )
#         FOR m IN 1..1 INBOUND a `movie-actor`
#         RETURN DISTINCT m._key
#   )
# )

#     LET directorMovieKeys = (
#     @directorName == null ? [] :
#     (
#         FOR d IN directors_view
#         SEARCH ANALYZER(
#             PHRASE(d.fullName, @directorName),
#             "text_en"
#         )
#       FOR m IN 1..1 INBOUND d `movie-director`
#         RETURN DISTINCT m._key
#   )
# )

# FOR m IN movies_view
#     SEARCH ANALYZER(
#         @term == "" OR
#         PHRASE(m.title, @term) OR
#         PHRASE(m.description, @term),
#         "text_en"
#     )

#     FILTER m.active == true

#     FILTER @actorName == null OR m._key IN actorMovieKeys
#     FILTER @directorName == null OR m._key IN directorMovieKeys

#     FILTER @releaseDateFrom == null OR (m.releaseDate != null AND m.releaseDate >= @releaseDateFrom)
#     FILTER @releaseDateTo == null OR (m.releaseDate != null AND m.releaseDate <= @releaseDateTo)
#     FILTER @minRuntime == null OR (m.runningTime != null AND m.runningTime >= @minRuntime)
#     FILTER @maxRuntime == null OR (m.runningTime != null AND m.runningTime <= @maxRuntime)

#     SORT BM25(m) DESC, m.releaseDate DESC
#     LIMIT @offset, @limit

#     RETURN { movie: m }
# """
#     payload = flask.request.get_json() or {}

#     # Pagination defaults
#     page = payload.get("page", 1)
#     page_size = payload.get("pageSize", 20)
#     offset = (page - 1) * page_size

#     # Bind variables for the AQL query
#     bind_vars = {
#             "term": payload.get("term", ""),
#             "actorName": payload.get("actorName"),
#             "directorName": payload.get("directorName"),
#             "releaseDateFrom": payload.get("releaseDateFrom"),
#             "releaseDateTo": payload.get("releaseDateTo"),
#             "minRuntime": payload.get("minRuntime"),
#             "maxRuntime": payload.get("maxRuntime"),
#             "offset": offset,
#             "limit": page_size
#         }
#     try:
#         cursor = db.aql.execute(query, bind_vars=bind_vars)
#         results = list(cursor)
#         return flask.jsonify(results)
#     except Exception as e:
#         return flask.jsonify({"error": str(e)}), 500

    payload = flask.request.get_json() or {}

    # Pagination
    page = payload.get("page", 1)
    page_size = payload.get("pageSize", 20)
    offset = (page - 1) * page_size

    # AQL query (actor-centric)
    query = """
FOR a IN directors_view
  SEARCH ANALYZER(true, "text_en")

  FILTER @directorName == null OR
    CONTAINS(LOWER(a.fullName), LOWER(@directorName))

  LET movies = (
    FOR m IN 1..1 INBOUND a `movie-director`
      FILTER @movieTitle == null OR
        CONTAINS(LOWER(m.title), LOWER(@movieTitle))
      RETURN {
        _key: m._key,
        title: m.title,
        releaseDate: m.releaseDate,
        runningTime: m.runningTime
      }
  )

  FILTER LENGTH(movies) > 0

  SORT a.fullName ASC
  LIMIT @offset, @limit

  RETURN {
    director: a,
    movies : movies
  }
    """

    bind_vars = {
        "directorName": payload.get("directorName"),
        "movieTitle": payload.get("movieTitle"),
        "offset": offset,
        "limit": page_size
    }

    try:
        cursor = db.aql.execute(query, bind_vars=bind_vars)
        results = list(cursor)
        return flask.jsonify({
            "page": page,
            "pageSize": page_size,
            "results": results
        })
    except Exception as e:
        return flask.jsonify({"error": str(e)}), 500
    
def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None