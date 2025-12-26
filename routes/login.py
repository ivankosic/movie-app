import flask
from flask import Blueprint
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from arango.exceptions import AQLQueryExecuteError
from config import get_db

login_bp = Blueprint("login_bp", __name__)
db = get_db()

@login_bp.route("/api/signup", methods=["POST"])
def signup():
    try:
        data = flask.request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return flask.jsonify({"error": "Missing username or password"}), 400

        # Check if user already exists
        check_query = """
        FOR u IN user
            FILTER u.username == @username
            RETURN u
        """
        bind_vars = {"username": username}
        cursor = db.aql.execute(check_query, bind_vars=bind_vars)
        if next(cursor, None):
            return flask.jsonify({"error": "Username already taken"}), 409

        # Hash password and insert user
        hashed_pw = generate_password_hash(password)
        query = """
                    LET u = {username : @username, password : @password}
                    INSERT u 
                    INTO user
                    RETURN u
                """
        
        db.aql.execute(query, bind_vars={"username" : username, "password" : hashed_pw})
        

        return flask.jsonify({"message": "Signup successful"}), 201

    except AQLQueryExecuteError as e:
        return flask.jsonify({"error": "Database query failed", "details": str(e)}), 500
    except Exception as e:
        return flask.jsonify({"error": "Unexpected error", "details": str(e)}), 500


@login_bp.route("/api/login", methods=["POST"])
def login():
    try:
        data = flask.request.get_json()
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return flask.jsonify({"error": "Invalid username or password"}), 400

        query = """
        FOR u IN user
            FILTER u.username == @username
            RETURN u
        """
        bind_vars = {"username": username}
        cursor = db.aql.execute(query, bind_vars=bind_vars)
        user = next(cursor, None)

        if not user or not check_password_hash(user["password"], password):
            return flask.jsonify({"error": "Invalid credentials"}), 401

        token = create_access_token(identity={"username": username})
        return flask.jsonify({"access_token": token}), 200

    except AQLQueryExecuteError as e:
        return flask.jsonify({"error": "Database query failed", "details": str(e)}), 500
    except Exception as e:
        return flask.jsonify({"error": "Unexpected error", "details": str(e)}), 500