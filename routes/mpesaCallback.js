const express = require("express");
const db = require("../config/db");
const { whitelistMAC } = require("../config/mikrotik");

const router = express.Router();

router.post("/callback", (req, res) => {
    console.log("MPesa Callback Received:", req.body);

    const callbackData = req.body.Body.stkCallback;
    const transactionId = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    if (resultCode === 0) {
        // Payment successful
        const amount = callbackData.CallbackMetadata.Item.find((item) => item.Name === "Amount").Value;

        db.query(
            "SELECT mac_address FROM payments WHERE transaction_id = ?",
            [transactionId],
            async (err, results) => {
                if (err || results.length === 0) {
                    console.error("Database fetch error:", err);
                    return res.status(500).json({ error: "MAC address not found" });
                }

                const mac = results[0].mac_address;
                let time = "1Hr";
                if (amount === 30) time = "24Hrs";
                else if (amount === 20) time = "12Hrs";
                else if (amount === 15) time = "4Hrs";

                const mikrotikResponse = await whitelistMAC(mac, time);

                if (mikrotikResponse.success) {
                    db.query("UPDATE payments SET status = 'confirmed' WHERE transaction_id = ?", [transactionId]);
                    res.json({ success: true, message: `Payment confirmed, MAC ${mac} whitelisted for ${time}` });
                } else {
                    res.status(500).json({ error: "MikroTik whitelist failed" });
                }
            }
        );
    } else {
        res.json({ success: false, message: "Payment failed" });
    }
});

module.exports = router;
