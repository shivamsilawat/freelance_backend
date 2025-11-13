const express = require("express");
const router = express.Router();
const Job = require("../models/Job");  // ✅ Correct model
const auth = require("../middleware/auth"); // ✅ JWT middleware

// 🧩 1️⃣ Get all jobs (public)
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    res.status(500).json({ message: "Server error while fetching jobs" });
  }
});

// 🧩 2️⃣ Create a new job (protected - only clients)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = req.user;

    if (user.role !== "client") {
      return res.status(403).json({ message: "Only clients can post jobs" });
    }

    const newJob = new Job({
      title,
      description,
      budget,
      clientId: user.id, // linked to logged-in user
    });

    await newJob.save();

    res.status(201).json({
      message: "✅ Job posted successfully",
      job: newJob,
    });
  } catch (err) {
    console.error("❌ Error posting job:", err);
    res.status(500).json({ message: "Server error while posting job" });
  }
});

// 🧩 3️⃣ Get logged-in client's own jobs (protected)
router.get("/my-jobs", auth, async (req, res) => {
  try {
    const user = req.user;
    const jobs = await Job.find({ clientId: user.id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Error fetching user's jobs:", err);
    res.status(500).json({ message: "Server error while fetching your jobs" });
  }
});

// 🧩 4️⃣ Search jobs (title / budget filter)
router.get("/search", async (req, res) => {
  try {
    const { title, minBudget, maxBudget } = req.query;
    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ message: "Server error during job search" });
  }
});

module.exports = router;
