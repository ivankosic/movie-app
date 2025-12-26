from arango import ArangoClient

def get_db():
    client = ArangoClient()
    return client.db("nosql-projekat", username="root", password="")