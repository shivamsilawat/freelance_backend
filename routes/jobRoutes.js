const express = require("express");
const router = express.Router();

const Job = require("../models/applicationModel"); // Import Job model
const auth = require("../middleware/auth"); // Import JWT middleware

// 🧩 1️⃣ Test route — to verify connection
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Server error while fetching jobs" });
  }
});

// 🧩 2️⃣ Protected route — Only logged-in (authenticated) users can post a job
router.post("/add", auth, async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    // Basic validation
    if (!title || !description || !budget) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // The "auth" middleware attaches the verified user to req.user
    const user = req.user;

    // Optional: Check if the logged-in user is a "client"
    if (user.role !== "client") {
      return res.status(403).json({ message: "Only clients can post jobs" });
    }

    // Create a new job in MongoDB
    const newJob = new Job({
      title,
      description,
      budget,
      clientId: user.id, // link job to user
    });

    await newJob.save();

    res.status(201).json({
      message: "Job posted successfully ✅",
      job: newJob,
    });
  } catch (err) {
    console.error("Error posting job:", err);
    res.status(500).json({ message: "Server error while posting job" });
  }
});



// 🧩 3️⃣ Protected route — Fetch jobs created by the logged-in client
router.get("/my-jobs", auth, async (req, res) => {
  try {
    const user = req.user;
    const jobs = await Job.find({ clientId: user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching user's jobs:", err);
    res.status(500).json({ message: "Server error while fetching your jobs" });
  }
});
// ✅ SEARCH JOBS (by title or budget)
app.get("/api/jobs/search", async (req, res) => {
  try {
    const { title, minBudget, maxBudget } = req.query;

    // Build a dynamic filter object
    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" }; // case-insensitive match
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
s

module.exports = router;
