const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

let client;
let db;

const connectDB = async () => {
  try {
    if (!client) {
      client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      console.log("MongoDB Connected");

      // Use DB_NAME from env OR database from URI
      db = client.db(process.env.DB_NAME);
    }
    return db;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
