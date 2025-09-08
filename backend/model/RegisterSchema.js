const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: [3, "First name must be at least 3 characters long"],
            maxlength: [20, "First name cannot exceed 20 characters"],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        password: {
            type: String,
            required: true,
            minlength: [6, "Password must be at least 6 characters long"],
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("register", registerSchema);
