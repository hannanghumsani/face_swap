const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const connectDB = require("../config/db"); // Adjust path if needed
const { ObjectId } = require("mongodb");

const createUser = async (req, res) => {
  try {
    // console.log("=== createUser called ===");
    // console.log(
    //   "Headers:",
    //   req.headers && {
    //     authorization: req.headers.authorization,
    //   }
    // );
    // console.log("Body:", req.body); // name, email, phone, termsAccepted
    // console.log("Files:", Object.keys(req.files || {})); // keys present

    const db = await connectDB();
    const usersCollection = db.collection("dummyusers");

    const { name, email, phone } = req.body;
    const termsAccepted =
      req.body.termsAccepted === "true" || req.body.termsAccepted === true;

    if (!name || !email || !phone || req.body.termsAccepted === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Validate phone format
    if (!/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "Phone must be exactly 10 digits" });
    }

    // Check if email or phone already exists (unique enforcement)
    const existingUser = await usersCollection.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone already exists" });
    }

    // Validate files
    if (!req.files || !req.files.picture || !req.files.swapPicture) {
      return res
        .status(400)
        .json({ message: "Both picture and swapPicture are required" });
    }

    // Build new user document
    const newUser = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      picture: {
        data: req.files.picture[0].buffer,
        contentType: req.files.picture[0].mimetype,
      },
      swapPicture: {
        data: req.files.swapPicture[0].buffer,
        contentType: req.files.swapPicture[0].mimetype,
      },
      termsAccepted: Boolean(termsAccepted),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        termsAccepted: newUser.termsAccepted,
      },
    });
  } catch (error) {
    console.error("createUser error:", error);

    // Duplicate key error (mongo)
    if (error.code === 11000) {
      const dupKey = Object.keys(error.keyValue || {}).join(", ");
      return res.status(400).json({ message: `Duplicate field: ${dupKey}` });
    }

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("dummyusers");

    const id = req.query.userId;

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await usersCollection.deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("dummyusers");

    let { perPage, page } = req.query;

    perPage = parseInt(perPage) || 10;
    page = parseInt(page) || 1;

    const totalUsers = await usersCollection.countDocuments();

    const users = await usersCollection
      .find()
      .skip((page - 1) * perPage)
      .limit(perPage)
      .toArray();

    // Convert Buffer to base64 for picture and swapPicture
    const usersWithBase64Images = users.map((user) => ({
      ...user,
      picture: user.picture
        ? {
            data: user.picture.data.toString("base64"),
            contentType: user.picture.contentType,
          }
        : null,
      swapPicture: user.swapPicture
        ? {
            data: user.swapPicture.data.toString("base64"),
            contentType: user.swapPicture.contentType,
          }
        : null,
    }));

    res.status(200).json({
      meta: {
        totalRecords: totalUsers,
        perPage,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / perPage),
      },
      users: usersWithBase64Images,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("dummyusers");

    const { id } = req.params;
    let user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert Buffer to base64 for picture and swapPicture
    const userWithBase64Images = {
      ...user,
      picture: user.picture
        ? {
            data: user.picture.data.toString("base64"),
            contentType: user.picture.contentType,
          }
        : null,
      swapPicture: user.swapPicture
        ? {
            data: user.swapPicture.data.toString("base64"),
            contentType: user.swapPicture.contentType,
          }
        : null,
    };

    res.status(200).json({ message: "User found", user: userWithBase64Images });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createRegister = async (req, res) => {
  try {
    const db = await connectDB();
    const registeredUsersCollection = db.collection("registers");

    const { firstName, email, password, confirmPassword } = req.body;

    if (!firstName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message:
          "All fields are required: firstName, email, password, confirmPassword.",
      });
    }

    // Validate firstName length
    const trimmedFirstName = firstName.trim();
    if (trimmedFirstName.length < 3) {
      return res
        .status(400)
        .json({ message: "First name must be at least 3 characters long" });
    }
    if (trimmedFirstName.length > 20) {
      return res
        .status(400)
        .json({ message: "First name cannot exceed 20 characters" });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    // Validate password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await registeredUsersCollection.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      firstName: trimmedFirstName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await registeredUsersCollection.insertOne(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.insertedId,
        firstName: newUser.firstName,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const db = await connectDB();
    const registeredUsersCollection = db.collection("registers");

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address" });
    }

    const user = await registeredUsersCollection.findOne({
      email: email.toLowerCase(),
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  createRegister,
  loginUser,
};
