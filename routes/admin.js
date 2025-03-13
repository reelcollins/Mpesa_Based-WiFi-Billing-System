const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Get All Payments for Admin Dashboard (Protected)
router.get("/admin/payments", authMiddleware, async (req, res) => {
    db.query(
        "SELECT phone, amount, time_purchased, status FROM payments ORDER BY time_purchased DESC",
        (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(results);
        }
    );
});

// ✅ Get Admin Summary (Protected)
router.get("/admin/summary", authMiddleware, async (req, res) => {
    const summaryQuery = `
        SELECT 
            (SELECT COUNT(DISTINCT phone) FROM payments WHERE status = 'confirmed') AS totalUsers,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'confirmed') AS totalRevenue,
            (SELECT COUNT(*) FROM sessions WHERE status = 'active') AS activeSessions,
            (SELECT COUNT(*) FROM payments WHERE status = 'pending') AS pendingPayments
    `;

    db.query(summaryQuery, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(results[0]); // ✅ Return summary data
    });
});

module.exports = router;
