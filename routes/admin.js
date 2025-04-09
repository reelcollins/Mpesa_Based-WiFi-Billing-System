const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Get All Payments for Admin Dashboard (Protected)
router.get("/admin/payments", authMiddleware, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT phone, amount, created_at AS time_purchased, status FROM payments ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database error" });
    }
});

// ✅ Get Admin Summary (Protected)
router.get("/admin/summary", authMiddleware, async (req, res) => {
    const summaryQuery = `
        SELECT 
            (SELECT COUNT(DISTINCT phone) FROM payments WHERE status = 'confirmed') AS totalUsers,
            (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'confirmed') AS totalRevenue,
            (SELECT COUNT(*) FROM payments WHERE status = 'active') AS activeSessions,
            (SELECT COUNT(*) FROM payments WHERE status = 'pending') AS pendingPayments
    `;

    try {
        const result = await db.query(summaryQuery);
        res.json(result.rows[0]); // ✅ Return summary data
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
