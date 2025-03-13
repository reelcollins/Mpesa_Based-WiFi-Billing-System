const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const mpesaRoutes = require("./routes/mpesaRoutes");
const mpesaCallback = require("./routes/mpesaCallback");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const getMacRoute = require("./routes/getMac");

const app = express();

// ✅ Configure CORS correctly
app.use(cors({
    origin: "http://localhost:5173", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow cookies & tokens
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Allow all methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow necessary headers
}));

// ✅ Middleware
app.use(bodyParser.json());

// ✅ Handle OPTIONS preflight requests
app.options("*", cors());

// Admin Routes
app.use("/api", adminRoutes);

// get MAC
app.use("/api", getMacRoute);

// ✅ Test Route to check CORS
app.get("/test-cors", (req, res) => {
    res.set("Access-Control-Allow-Origin", "http://localhost:5173");
    res.json({ message: "CORS is working!" });
});

// ✅ Register Routes
app.use("/api/mpesa", mpesaRoutes);
app.use("/mpesa", mpesaCallback);
app.use("/auth", authRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
    res.send("Kibaruani Billing System Backend is Running!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
