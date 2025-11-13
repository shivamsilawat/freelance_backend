// server.js
require('dotenv').config(); // ✅ Load environment variables

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const MONGO_URL = "your_connection_string_here"
// Models
const Job = require("./models/job");
const Application = require("./models/applicationModel");
const User = require("./models/User"); // ✅ Make sure User model is only defined once

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../frontend")));

console.log("Mongo URI:", process.env.MONGO_URI);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// -----------------------
// Routes
app.get("/debug", (req, res) => {
  res.json({ message: "✅ Server is running fine" });
});

const userRoutes = require("./routes/userRoutes"); 
app.use("/api", userRoutes); 




// -----------------------

// Ping test
app.get('/ping', (req, res) => res.send('pong'));

// Home
app.get("/", (req, res) => {
  res.send("✅ Server is running and MongoDB is connected");
});

// -----------------------
// Auth Routes
// -----------------------

// Signup
app.post("/signup", async (req, res) => {
  console.log("Signup body:", req.body);
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    // Updated JSON response with user info
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// Job Routes
const jobRoutes = require("./routes/jobRoutes");
app.use("/api/jobs", jobRoutes);

// -----------------------

// Get all jobs
app.get("/api/jobs/getjobs", async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// Create job
app.post("/api/jobs/create", async (req, res) => {
  try {
    const { title, description, budget, clientId } = req.body;

    if (!title || !description || !budget || !clientId)
      return res.status(400).json({ message: "All fields are required" });

    const job = new Job({ title, description, budget, clientId, createdAt: new Date() });
    await job.save();

    res.status(201).json({ message: "✅ Job posted successfully!", job });
  } catch (err) {
    console.error("Error posting job:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// post job 
app.post("/jobs", async (req, res) => {
  const { title, description, budget, postedBy } = req.body;

  if (!title || !description || !budget || !postedBy)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const newJob = new Job({ title, description, budget, postedBy });
    await newJob.save();

    res.status(201).json({
      message: "Job posted successfully",
      job: newJob
    });
  } catch (err) {
    console.error("Post job error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// -----------------------
// Application Routes
// -----------------------
const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/applications", applicationRoutes);

// -----------------------
// Payment Routes
// -----------------------
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

app.use(express.static(path.join(__dirname, 'frontend')));
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -----------------------
// Start Server
// -----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
