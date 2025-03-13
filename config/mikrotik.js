require("dotenv").config();
const { RouterOSClient } = require("node-routeros");

async function connectToMikrotik() {
    try {
        const client = new RouterOSClient([
            process.env.MIKROTIK_HOST,
            process.env.MIKROTIK_USER,
            process.env.MIKROTIK_PASS
        ]);

        await client.connect();
        
        // Your operations here
        
        await client.close();
    } catch (error) {
        console.error("MikroTik Connection Error:", error);
    }
}

const whitelistMAC = async (mac, time) => {
    const client = new RouterOSClient([
        process.env.MIKROTIK_HOST,
        process.env.MIKROTIK_USER,
        process.env.MIKROTIK_PASS
    ]);

    try {
        const duration = {
            "1Hr": "1h",
            "4Hrs": "4h",
            "12Hrs": "12h",
            "24Hrs": "1d"
        }[time];

        if (!duration) return { success: false, message: "Invalid time selection" };

        await client.connect();
        await client.write([
            "/ip/hotspot/ip-binding/add",
            `=mac-address=${mac}`,
            "=type=bypassed",
            `=comment=WiFi-Paid-${duration}`
        ]);
        
        await client.close();

        return { success: true, message: `MAC ${mac} whitelisted for ${duration}` };
    } catch (error) {
        console.error("MikroTik Error:", error);
        return { success: false, message: "MikroTik whitelist failed" };
    }
};

module.exports = { whitelistMAC };