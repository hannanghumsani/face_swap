const express = require("express");
const multer = require("multer");
const {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  createRegister,
  loginUser,
} = require("../controller/userController");
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();

// Multer config → store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
router.post(
  "/addUser",
  authenticateUser,
  upload.fields([
    { name: "picture", maxCount: 1 },
    { name: "swapPicture", maxCount: 1 },
  ]),
  createUser
);

router.delete("/", authenticateUser, deleteUser);
router.get("/", authenticateUser, getAllUsers);
router.get("/userById/:id", authenticateUser, getUserById);
router.post("/register", createRegister);
router.post("/login", loginUser);

module.exports = router;
