// middleware/sanitizer.js
const striptags = require("striptags");

const sanitizeInput = (req, res, next) => {
  if (req.body.name) {
    req.body.name = striptags(req.body.name).trim();
  }
  if (req.body.email) {
    req.body.email = striptags(req.body.email).trim();
  }
  if (req.body.phone) {
    req.body.phone = striptags(req.body.phone).trim();
  }
  next();
};

module.exports = sanitizeInput;
