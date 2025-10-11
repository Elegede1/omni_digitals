import os
from pymongo import MongoClient

# Get the MongoDB connection string from environment variables
MONGO_URI = os.environ.get("MONGO_URI")

client = MongoClient(MONGO_URI)

# Select your database
db = client.get_database("omni_digitals_db")

# Example: Get a collection
my_collection = db.get_collection("my_data_collection")