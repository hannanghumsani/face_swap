const express = require("express");
require("dotenv").config();
const connectDB = require("./config/db");
const userRoutes = require("./route/userRoute");
const cors = require("cors");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express server is running!");
});

app.use("/user", userRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
