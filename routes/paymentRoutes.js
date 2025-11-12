const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

// ✅ Create Razorpay instance (Test Keys)
const razorpay = new Razorpay({
  key_id: "rzp_test_1234567890abc", // ⚠️ Replace with your test key_id
  key_secret: "your_test_secret_key", // ⚠️ Replace with your test key_secret
});

// ✅ Create Order (Client initiates payment)
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;
    const options = {
      amount: amount * 100, // convert to paise
      currency,
      receipt: "receipt_" + Date.now(),
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Verify Payment Signature
router.post("/verify-payment", (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    const generated_signature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(order_id + "|" + payment_id)
      .digest("hex");

    if (generated_signature === signature) {
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
