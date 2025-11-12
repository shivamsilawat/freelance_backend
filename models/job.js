const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  company: { type: String, default: "Unknown Company" },
  clientId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent model overwrite error
module.exports = mongoose.models.Job || mongoose.model("Job", JobSchema);
