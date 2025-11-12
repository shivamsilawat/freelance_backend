const jwt = require("jsonwebtoken");

const JWT_SECRET = "your_secret_key"; // Replace with a strong secret!

module.exports = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Store user info for next use
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
