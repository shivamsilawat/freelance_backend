const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "freelancer"], default: "freelancer" },
  skills: [String], // optional: freelancer skills
  bio: String
});

// ✅ Check if model exists, otherwise create it
const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
