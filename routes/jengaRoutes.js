const express = require("express");
const { processPayment } = require("../config/jenga");
const db = require("../config/db");

const router = express.Router();

router.post("/pay", async (req, res) => {
    console.log("📩 Incoming Jenga Payment Request:", req.body);

    const { phone, amount, mac_address } = req.body;

    // ✅ Validate required fields
    if (!phone || !amount || !mac_address) {
        console.error("❌ Missing required fields:", req.body);
        return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Validate phone number format (must be in 254XXXXXXXXX format)
    if (!/^254\d{9}$/.test(phone)) {
        console.error("❌ Invalid phone number format:", phone);
        return res.status(400).json({ error: "Invalid phone number. Use 254XXXXXXXXX format." });
    }

    const transactionId = `TXN_${Date.now()}`;
    console.log(`💾 Saving transaction: ${transactionId} - Amount: ${amount} - Phone: ${phone}`);

    // ✅ Save to database as "pending"
    db.query(
        "INSERT INTO payments (phone, amount, transaction_id, mac_address, status) VALUES ($1, $2, $3, $4, 'pending')",
        [phone, amount, transactionId, mac_address])
        .then(async () => {
            console.log("📤 Sending Jenga Payment Request...");
            try {
                const response = await processPayment(phone, amount, transactionId);
                if (!response) {
                    console.error("❌ Jenga Payment Request failed. No response received.");
                    return res.status(500).json({ error: "Payment request failed. No response from Jenga API." });
                }

                console.log("✅ Jenga Payment Request Successful:", response);
                return res.json({ 
                    success: true, 
                    message: "Payment request sent!",
                    paymentLink: response.paymentLink, // Jenga might provide a payment link or other info
                    transactionId: transactionId,
                    response 
                });

            } catch (error) {
                console.error("❌ Jenga Payment Error:", error.response ? error.response.data : error.message);
                return res.status(500).json({ error: "Payment request failed", details: error.message });
            }
        })
        .catch(err => {
            console.error("❌ Database error:", err);
            return res.status(500).json({ error: "Database error", details: err.message });
        });
});

// Webhook endpoint for Jenga API callbacks
router.post("/callback", async (req, res) => {
    console.log("Jenga Callback Received:", req.body);

    const callbackData = req.body;
    const transactionId = callbackData.merchantReference;
    const paymentStatus = callbackData.status;

    if (paymentStatus === "Success") {
        // Payment successful
        try {
            // Get the MAC address from the database
            const result = await db.query(
                "SELECT mac_address FROM payments WHERE transaction_id = $1",
                [transactionId]
            );

            if (result.rows.length === 0) {
                console.error("MAC address not found");
                return res.status(500).json({ error: "MAC address not found" });
            }

            const mac = result.rows[0].mac_address;
            
            // Determine time limit based on amount
            let timeLimit = "1h";
            const amount = callbackData.amount;
            if (amount === 30) timeLimit = "24h";
            else if (amount === 20) timeLimit = "12h";
            else if (amount === 15) timeLimit = "4h";
            else if (amount === 1) timeLimit = "1h";  // 1 KSH for testing

            // Generate a random password for the hotspot user
            const password = Math.random().toString(36).slice(-8);
            
            // Connect to MikroTik router
            const mikrotikService = require("../services/mikrotik");
            await mikrotikService.connect();
            
            // Add hotspot user
            await mikrotikService.addHotspotUser(mac, password, "default", timeLimit);
            
            // Disconnect from router
            await mikrotikService.disconnect();

            // Update payment status in database
            await db.query(
                "UPDATE payments SET status = 'confirmed' WHERE transaction_id = $1",
                [transactionId]
            );

            res.json({ 
                success: true, 
                message: `Payment confirmed, hotspot access granted for ${timeLimit}`,
                credentials: {
                    username: mac,
                    password: password
                }
            });
        } catch (error) {
            console.error("Error processing payment:", error);
            res.status(500).json({ error: "Failed to process payment", details: error.message });
        }
    } else {
        // Payment failed
        await db.query(
            "UPDATE payments SET status = 'failed' WHERE transaction_id = $1",
            [transactionId]
        );
        res.json({ success: false, message: "Payment failed" });
    }
});

module.exports = router; 