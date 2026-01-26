import flask
from flask import Blueprint
from arango.exceptions import AQLQueryExecuteError
from config import get_db

movie_bp = Blueprint("movie_bp", __name__)
db = get_db()

@movie_bp.route("/api/movies", methods=["GET"])
def get_all_movies():
    query = """
            FOR m IN movie
    LET actors = (
        FOR e IN `movie-actor`
            FILTER e._from == m._id
            LET a = DOCUMENT(e._to)
            FILTER a != null
            RETURN { actor: a }
    )
    
    LET directors = (
        FOR e IN `movie-director`
            FILTER e._from == m._id
            LET d = DOCUMENT(e._to)
            FILTER d != null
            RETURN { director: d }
    )
    
    LET genres = (
        FOR e in `movie-genre`
            FILTER e._from == m._id
            let g = document(e._to)
            filter g != null
            return { genre : g}
    )
    
    
    RETURN {
        movie: m,
        actors: actors,
        directors : directors,
        genres : genres
    }
            """
    cursor = db.aql.execute(query)
    data = [doc for doc in cursor]
    return flask.jsonify(data if data else {"message": "No data to fetch"})


@movie_bp.route("/api/movies/active", methods=["GET"])
def get_all_active():
    query = """
        LET total = LENGTH(
            FOR m IN movie
                FILTER m.active == true
                RETURN 1
            )

            LET data = (
            FOR m IN movie
                FILTER m.active == true
                SORT m._key ASC
                LIMIT @offset, @page_size

                LET actors = (
                FOR e IN `movie-actor`
                    FILTER e._from == m._id
                    LET a = DOCUMENT(e._to)
                    FILTER a != null
                    RETURN a
                )

                LET directors = (
                FOR e IN `movie-director`
                    FILTER e._from == m._id
                    LET d = DOCUMENT(e._to)
                    FILTER d != null
                    RETURN d
                )

                LET genres = (
                FOR e IN `movie-genre`
                    FILTER e._from == m._id
                    LET g = DOCUMENT(e._to)
                    FILTER g != null
                    RETURN g
                )

                RETURN {
                movie: m,
                actors,
                directors,
                genres
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

@movie_bp.route("/api/movies/<path:id>", methods=["GET"])
def get_movie_by_id(id):
    doc_id = f"movie/{id}"
    query = """
        LET m = DOCUMENT(@id)

        LET actors = (
            FOR e IN `movie-actor`
                FILTER e._from == m._id
                LET a = DOCUMENT(e._to)
                FILTER a != null
                RETURN { actor: a }
        )

        LET directors = (
            FOR e IN `movie-director`
                FILTER e._from == m._id
                LET d = DOCUMENT(e._to)
                FILTER d != null
                RETURN { director: d }
        )

        LET genres = (
            FOR e IN `movie-genre`
                FILTER e._from == m._id
                LET g = DOCUMENT(e._to)
                FILTER g != null
                RETURN { genre: g }
        )

        RETURN {
            movie: m,
            actors: actors,
            directors: directors,
            genres: genres
        }
    """
    cursor = db.aql.execute(query, bind_vars={"id": doc_id})
    data = [doc for doc in cursor]

    if not data or data[0] is None:
        return flask.jsonify({"message": "No data to fetch"}), 404

    return flask.jsonify(data[0])




@movie_bp.route("/api/movies", methods = ["POST"])
def create_movie():
    data = flask.request.json

    query = f"INSERT @doc INTO movie RETURN NEW"

    entry = list(db.aql.execute(query, bind_vars={"doc" : data}))

    if not entry:
        return flask.jsonify({"error" : "Error inserting entry into the database!"}, 404)
    return flask.jsonify(entry[0]),201

@movie_bp.route("/api/movies/<path:id>", methods=["PUT"])
def update_movie(id):
    print(f"Update route hit with id: {id}")

    if not id.startswith("movie/"):
        id = f"movie/{id}"

    data = flask.request.json
    print(f"Received JSON: {data}")
    if not data or not isinstance(data, dict):
        return flask.jsonify({"error": "No valid update data provided"}), 400

    try:
        query = "UPDATE DOCUMENT(@id) WITH @doc IN movie RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id, "doc": data}))
        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": f"Movie with id '{id}' not found"}), 404

@movie_bp.route("/api/movies/<path:id>", methods=["DELETE"])
def delete_movie(id):
    print(f"Delete route hit with id: {id}")

    if not id.startswith("movie/"):
        id = f"movie/{id}"

    try:
        delete_query = "REMOVE DOCUMENT(@id) IN movie RETURN OLD"
        entry = list(db.aql.execute(delete_query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during deletion"}), 500


@movie_bp.route("/api/movies/softDelete/<path:id>", methods=["PUT"])
def soft_delete_movie(id):
    print(f"Soft delete route hit with id: {id}")

    if not id.startswith("movie/"):
        id = f"movie/{id}"

    try:
        # Check if document exists first
        check_query = "RETURN DOCUMENT(@id)"
        check = list(db.aql.execute(check_query, bind_vars={"id": id}))
        if not check or check[0] is None:
            return flask.jsonify({"error": f"Movie with id '{id}' not found"}), 404

        query = "UPDATE DOCUMENT(@id) WITH { active : false } IN movie RETURN NEW"
        entry = list(db.aql.execute(query, bind_vars={"id": id}))

        return flask.jsonify(entry[0]), 200

    except AQLQueryExecuteError as e:
        print(f"AQL error: {e}")
        return flask.jsonify({"error": "Database error during soft delete"}), 500

@movie_bp.route("/api/movies/search", methods=["POST"])
def search():
    query = """
            FOR m IN movies_view
            SEARCH ANALYZER(
                @searchText == null OR 
                STARTS_WITH(m.title, @searchText) OR 
                STARTS_WITH(m.description, @searchText) OR
                PHRASE(m.title, @searchText) OR 
                PHRASE(m.description, @searchText),
                "text_en"
            )
            AND (
                    (@releaseDateStart == null OR m.releaseDate >= @releaseDateStart) AND
                    (@releaseDateEnd == null OR m.releaseDate <= @releaseDateEnd)
                )
            AND (
                    (@runningTimeMin == null OR m.runningTime >= @runningTimeMin) AND
                    (@runningTimeMax == null OR m.runningTime <= @runningTimeMax)
                )


            LET actors = (
                FOR actor IN 1..1 OUTBOUND m `movie-actor`
                FILTER actor.active == true
                FILTER @actorName == null OR 
                    LIKE(actor.fullName, CONCAT("%", @actorName, "%"), true)
                RETURN actor
            )

            LET directors = (
                FOR director IN 1..1 OUTBOUND m `movie-director`
                FILTER director.active == true
                FILTER @directorName == null OR 
                    LIKE(director.fullName, CONCAT("%", @directorName, "%"), true)
                RETURN director
            )

            LET genres = (
                FOR genre IN 1..1 OUTBOUND m `movie-genre`
                FILTER genre.active == true
                FILTER @genreName == null OR 
                    LIKE(genre.name, CONCAT("%", @genreName, "%"), true)
                RETURN genre
            )

            // If there is actor/director/genre provided, filter by that parameter also 
            FILTER @actorName == null OR LENGTH(actors) > 0
            FILTER @directorName == null OR LENGTH(directors) > 0
            FILTER @genreName == null OR LENGTH(genres) > 0

            LIMIT @offset, @limit

            RETURN {
                movie: m,
                actors: actors,
                directors: directors,
                genres: genres
            }
            """

    payload = flask.request.get_json(force=True)

    page = int(payload.get("page", 1))
    page_size = int(payload.get("pageSize", 20))
    offset = (page - 1) * page_size

    bind_vars = {
        "searchText": payload.get("searchText", "") or None,
        "actorName": payload.get("actorName") or None,
        "directorName": payload.get("directorName") or None,
        "genreName": payload.get("genreName") or None,
        "releaseDateStart": payload.get("releaseDateStart") or None,
        "releaseDateEnd": payload.get("releaseDateEnd") or None,
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

@movie_bp.route("/api/movies/<path:id>/recommend")
def recommend_movie(id):
        recommend_query = """
    LET target = DOCUMENT("movie", @id)

    LET relatedActors = (
        FOR v IN 1 OUTBOUND target `movie-actor`
        RETURN v._id
    )

    LET relatedDirectors = (
        FOR v IN 1 OUTBOUND target `movie-director`
        RETURN v._id
    )

    LET relatedGenres = (
        FOR v IN 1 OUTBOUND target `movie-genre`
        RETURN v._id
    )

    LET candidates = FLATTEN([
        (
            FOR a IN relatedActors
                FOR m IN INBOUND a `movie-actor`
                FILTER m._id != target._id
                RETURN { movie: m, type: "actor" }
        ),
        (
            FOR d IN relatedDirectors
                FOR m IN INBOUND d `movie-director`
                FILTER m._id != target._id
                RETURN { movie: m, type: "director" }
        ),
        (
            FOR g IN relatedGenres
                FOR m IN INBOUND g `movie-genre`
                FILTER m._id != target._id
                RETURN { movie: m, type: "genre" }
        )
    ])

    LET scored = (
        FOR c IN candidates
            COLLECT movie = c.movie INTO group = c.type
            LET sharedActors = LENGTH(FOR t IN group FILTER t == "actor" RETURN 1)
            LET sharedDirectors = LENGTH(FOR t IN group FILTER t == "director" RETURN 1)
            LET sharedGenres = LENGTH(FOR t IN group FILTER t == "genre" RETURN 1)
            LET score = sharedActors * 3 + sharedDirectors * 2 + sharedGenres * 1
            SORT score DESC
            LIMIT 10
            RETURN {
                movie,
                score,
                sharedActors,
                sharedDirectors,
                sharedGenres
            }
    )

    RETURN scored
    """


        try:
            cursor = db.aql.execute(recommend_query, bind_vars={"id": id})
            recommendations = list(cursor)
            return flask.jsonify(recommendations)
        except Exception as e:
            import traceback
            print("Error running query:")
            print(traceback.format_exc())
            return flask.jsonify({"error": str(e)}), 500


def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
