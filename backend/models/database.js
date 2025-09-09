const { MongoClient } = require("mongodb");
require("dotenv").config(); // <-- load .env first

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error("MONGO_URI is not defined in .env file");
}

const client = new MongoClient(uri);

async function connect() {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

function getDb() {
  return client.db(dbName);
}

module.exports = { connect, getDb };
