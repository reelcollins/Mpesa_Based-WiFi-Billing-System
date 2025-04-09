require("dotenv").config();
const axios = require("axios");

// Jenga API Environment
const JENGA_ENV = process.env.JENGA_ENV || "sandbox"; // "sandbox" or "production"
const JENGA_BASE_URL = JENGA_ENV === "sandbox" 
    ? "https://sandbox.jengaapi.io" 
    : "https://api.jengaapi.io";

// Required environment variables for Jenga API
const REQUIRED_ENV_VARS = [
    "JENGA_API_KEY",
    "JENGA_MERCHANT_CODE",
    "JENGA_CONSUMER_SECRET",
    "JENGA_PRIVATE_KEY_PATH"
];

for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
        console.error(`❌ Missing environment variable: ${varName}`);
        process.exit(1);
    }
}

// Get auth token from Jenga API
const getAuthToken = async () => {
    try {
        // In a real implementation, you would sign the request with your private key
        // This is a simplified example
        const auth = Buffer.from(`${process.env.JENGA_API_KEY}:${process.env.JENGA_CONSUMER_SECRET}`).toString("base64");
        
        const response = await axios.post(`${JENGA_BASE_URL}/identity/v2/token`, {}, {
            headers: { 
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        
        console.log("✅ Jenga API Auth Token Obtained Successfully");
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Jenga API Auth Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

// Process payment via Jenga API
const processPayment = async (phone, amount, transactionId) => {
    console.log(`📩 Jenga Payment Request: Phone: ${phone}, Amount: ${amount}, TransactionID: ${transactionId}`);

    const authToken = await getAuthToken();
    if (!authToken) {
        console.error("❌ Failed to get Jenga API auth token. Payment aborted.");
        return null;
    }

    const payload = {
        customer: {
            countryCode: "KE",
            mobileNumber: phone.replace(/^254/, ""),
        },
        transaction: {
            amount: amount,
            description: `WiFi Payment - ${transactionId}`,
            type: "EazzyPay", // For mobile payments
            references: {
                merchantReference: transactionId,
                deviceReference: Date.now().toString()
            }
        }
    };

    try {
        console.log("📤 Sending Jenga Payment Request...");
        const response = await axios.post(
            `${JENGA_BASE_URL}/v2/checkout/payment`,
            payload,
            {
                headers: { 
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                    "Api-Key": process.env.JENGA_API_KEY,
                    "Signature": "YOUR_SIGNATURE_LOGIC_HERE" // You'll need to implement signature generation
                }
            }
        );

        if (response.data.status === "Success") {
            console.log("✅ Jenga Payment Request Successful:", response.data);
            return response.data;
        } else {
            console.error("❌ Jenga Payment Request Failed:", response.data);
            return null;
        }
    } catch (error) {
        console.error("❌ Jenga API Payment Error:", error.response ? error.response.data : error.message);
        return null;
    }
};

module.exports = { processPayment }; 