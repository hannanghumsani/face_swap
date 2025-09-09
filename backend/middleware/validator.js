const validator = require("validator");
const fs = require("fs");

const validateInput = (req, res, next) => {
  const { name, email, phone, tc } = req.body;
  const errors = {};

  if (!name || !/^[A-Za-z\s]{4,30}$/.test(name)) {
    errors.name =
      "Name must be 4-30 characters long and contain only alphabets.";
  }
  if (!email || !validator.isEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!phone || !/^\d{10}$/.test(phone)) {
    errors.phone = "Phone number must be exactly 10 digits.";
  }
  if (!tc) {
    errors.tc = "You must accept the terms and conditions.";
  }

  const files = req.files || {};
  const originalFile = files.originalFile ? files.originalFile[0] : null;
  const swapFile = files.swapFile ? files.swapFile[0] : null;

  if (!originalFile) {
    errors.originalFile = "An original photo is required.";
  } else {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxFileSize = 2 * 1024 * 1024; // 2 MB
    if (!allowedTypes.includes(originalFile.mimetype)) {
      errors.originalFile = "Invalid file type. Only JPG/PNG allowed.";
    }
    if (originalFile.size > maxFileSize) {
      errors.originalFile = "File size exceeds 2MB limit.";
    }
  }

  if (!swapFile) {
    errors.swapFile = "A swap photo is required.";
  } else {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxFileSize = 2 * 1024 * 1024; // 2 MB
    if (!allowedTypes.includes(swapFile.mimetype)) {
      errors.swapFile = "Invalid file type. Only JPG/PNG allowed.";
    }
    if (swapFile.size > maxFileSize) {
      errors.swapFile = "File size exceeds 2MB limit.";
    }
  }

  if (Object.keys(errors).length > 0) {
    if (originalFile)
      fs.unlink(originalFile.path, (err) => {
        if (err) console.error("Failed to delete original file:", err);
      });
    if (swapFile)
      fs.unlink(swapFile.path, (err) => {
        if (err) console.error("Failed to delete swap file:", err);
      });
    return res.status(400).render("index", { errors, values: req.body });
  }

  next();
};

module.exports = validateInput;
