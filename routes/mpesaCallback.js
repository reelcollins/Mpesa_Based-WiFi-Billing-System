const express = require("express");
const db = require("../config/db");
const mikrotikService = require("../services/mikrotik");

const router = express.Router();

router.post("/callback", async (req, res) => {
    console.log("MPesa Callback Received:", req.body);

    const callbackData = req.body.Body.stkCallback;
    const transactionId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    if (resultCode === 0) {
        // Payment successful
        const amount = callbackData.CallbackMetadata.Item.find((item) => item.Name === "Amount").Value;

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
            if (amount === 30) timeLimit = "24h";
            else if (amount === 20) timeLimit = "12h";
            else if (amount === 15) timeLimit = "4h";
            else if (amount === 1) timeLimit = "1h";  // 1 KSH for testing

            // Generate a random password for the hotspot user
            const password = Math.random().toString(36).slice(-8);
            
            // Connect to MikroTik router
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
