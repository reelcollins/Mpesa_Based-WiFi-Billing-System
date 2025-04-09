const express = require("express");
const { stkPush } = require("../config/mpesa");
const db = require("../config/db");

const router = express.Router();

router.post("/pay", async (req, res) => {
    console.log("📩 Incoming STK Push Request:", req.body);

    const { phone, amount, mac_address } = req.body;

    // ✅ Validate required fields
    if (!phone || !amount || !mac_address) {
        console.error("❌ Missing required fields:", req.body);
        return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Validate phone number format (must be in 2547XXXXXXXX format)
    if (!/^2547\d{8}$/.test(phone)) {
        console.error("❌ Invalid phone number format:", phone);
        return res.status(400).json({ error: "Invalid phone number. Use 2547XXXXXXXX format." });
    }

    const transactionId = `TXN_${Date.now()}`;
    console.log(`💾 Saving transaction: ${transactionId} - Amount: ${amount} - Phone: ${phone}`);

    // ✅ Save to database as "pending"
    db.query(
        "INSERT INTO payments (phone, amount, transaction_id, mac_address, status) VALUES ($1, $2, $3, $4, 'pending')",
        [phone, amount, transactionId, mac_address])
        .then(async () => {
            console.log("📤 Sending STK Push...");
            try {
                const response = await stkPush(phone, amount, transactionId);
                if (!response) {
                    console.error("❌ STK Push failed. No response received.");
                    return res.status(500).json({ error: "STK Push failed. No response from MPesa API." });
                }

                console.log("✅ STK Push Successful:", response);
                return res.json({ success: true, message: "STK Push sent!", response });

            } catch (error) {
                console.error("❌ MPesa STK Push Error:", error.response ? error.response.data : error.message);
                return res.status(500).json({ error: "STK Push request failed", details: error.message });
            }
        })
        .catch(err => {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        });
});

module.exports = router;
