const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const auth = require("../middleware/auth"); // make sure you have auth middleware

// ✅ Get all freelancers
router.get("/freelancers", async (req, res) => {
  try {
    const freelancers = await User.find({ role: "freelancer" }).select("-password"); // hide password
    res.json(freelancers);
  } catch (err) {
    console.error("Error fetching freelancers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get single freelancer by ID
router.get("/freelancer/:id", async (req, res) => {
  try {
    const freelancer = await User.findById(req.params.id).select("-password");
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });
    res.json(freelancer);
  } catch (err) {
    console.error("Error fetching freelancer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update freelancer profile (auth required)
router.put("/freelancer/:id", auth, async (req, res) => {
  try {
    const { username, email, skills, bio } = req.body;

    const freelancer = await User.findById(req.params.id);
    if (!freelancer) return res.status(404).json({ message: "Freelancer not found" });

    // Only allow freelancer to update their own profile
    if (req.user.id !== freelancer._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    freelancer.username = username || freelancer.username;
    freelancer.email = email || freelancer.email;
    freelancer.skills = skills || freelancer.skills;
    freelancer.bio = bio || freelancer.bio;

    await freelancer.save();
    res.json({ message: "Profile updated successfully", freelancer });
  } catch (err) {
    console.error("Error updating freelancer:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Search freelancers by name or skill
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query required" });

    const freelancers = await User.find({
      role: "freelancer",
      $or: [
        { username: { $regex: q, $options: "i" } },
        { skills: { $regex: q, $options: "i" } }
      ]
    }).select("-password");

    res.json(freelancers);
  } catch (err) {
    console.error("Error searching freelancers:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
