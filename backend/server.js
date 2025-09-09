const express = require("express");
const path = require("path");
const ejs = require("ejs");
const indexRouter = require("./routes/index");
const submissionsRouter = require("./routes/submissions");
const db = require("./models/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

db.connect();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", indexRouter);
app.use("/submissions", submissionsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
