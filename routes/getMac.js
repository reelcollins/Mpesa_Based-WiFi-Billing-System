const express = require("express");
const router = express.Router();
const { exec } = require("child_process");

const getMacAddress = (ip) => {
    return new Promise((resolve, reject) => {
        if (!ip) return resolve(null);

        exec(`arp -a | find "${ip}"`, (error, stdout) => {
            if (error) {
                console.error("Error fetching MAC address:", error);
                return reject("Error fetching MAC address.");
            }

            const macRegex = /([a-fA-F0-9]{2}[:-]){5}[a-fA-F0-9]{2}/;
            const macMatch = stdout.match(macRegex);
            resolve(macMatch ? macMatch[0] : "MAC_NOT_FOUND");
        });
    });
};

router.get("/get-mac", async (req, res) => {
    try {
        const ip = req.query.ip;
        if (!ip) return res.status(400).json({ success: false, message: "IP address is required." });

        const macAddress = await getMacAddress(ip);
        res.json({ success: true, mac: macAddress });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
