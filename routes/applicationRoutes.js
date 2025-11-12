const express = require("express");
const router = express.Router();
const Application = require("../models/applicationModel");
const auth = require("../middleware/auth");

// ✅ APPLY FOR A JOB (Freelancer)
router.post("/apply", auth, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const freelancerId = req.user.id;

    if (!jobId || !coverLetter) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // prevent duplicate applications for the same job
    const existingApp = await Application.findOne({ jobId, freelancerId });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    const newApplication = new Application({
      jobId,
      freelancerId,
      coverLetter,
      status: "Pending",
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully!" });
  } catch (err) {
    console.error("❌ Error applying for job:", err);
    res.status(500).json({ message: "Server error while applying for job" });
  }
});


// ✅ GET ALL APPLICATIONS FOR A SPECIFIC JOB (For client dashboard)
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const applications = await Application.find({ jobId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this job." });
    }

    res.json(applications);
  } catch (err) {
    console.error("❌ Error fetching job applications:", err);
    res.status(500).json({ message: "Server error while fetching applications" });
  }
});


// ✅ GET ALL APPLICATIONS SUBMITTED BY LOGGED-IN FREELANCER
router.get("/my", auth, async (req, res) => {
  try {
    const freelancerId = req.user.id;
    const myApplications = await Application.find({ freelancerId })
      .populate("jobId", "title description budget")
      .sort({ createdAt: -1 });

    res.json(myApplications);
  } catch (err) {
    console.error("❌ Error fetching freelancer applications:", err);
    res.status(500).json({ message: "Server error while fetching applications" });
  }
});


// ✅ UPDATE APPLICATION STATUS (Client can accept/reject)
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Accepted", "Rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedApp) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      message: `Application ${status} successfully!`,
      updatedApp,
    });
  } catch (err) {
    console.error("❌ Error updating application status:", err);
    res.status(500).json({ message: "Server error while updating status" });
  }
});

module.exports = router;
