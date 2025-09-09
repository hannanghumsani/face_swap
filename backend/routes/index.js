const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");
const validateInput = require("../middleware/validator");
const sanitizeInput = require("../middleware/sanitizer");

router.get("/", formController.getForm);

router.post(
  "/submit",
  formController.upload.fields([
    { name: "originalFile", maxCount: 1 },
    { name: "swapFile", maxCount: 1 },
  ]),
  sanitizeInput,
  validateInput,
  formController.submitForm
);

module.exports = router;
