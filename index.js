const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const { Pool } = require('pg');

const mpesaRoutes = require("./routes/mpesaRoutes");
const mpesaCallback = require("./routes/mpesaCallback");
const jengaRoutes = require("./routes/jengaRoutes");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const getMacRoute = require("./routes/getMac");

const app = express();

// CORS configuration for both development and production
const allowedOrigins = ['http://localhost:5173', 'https://kibeezy-wifi-frontend.herokuapp.com'];

// ✅ Configure CORS correctly
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // Just allow all for now
        }
        return callback(null, true);
    },
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
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
    } else {
        res.set("Access-Control-Allow-Origin", allowedOrigins[0]);
    }
    res.json({ message: "CORS is working!" });
});

// ✅ Register Routes
app.use("/api/mpesa", mpesaRoutes);
app.use("/mpesa", mpesaCallback);
app.use("/api/jenga", jengaRoutes);
app.use("/auth", authRoutes);

// ✅ Health Check Route
app.get("/", (req, res) => {
    res.send("Kibaruani Billing System Backend is Running!");
});

// Change MySQL connection to PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

// Replace any mysql connection with this
pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to PostgreSQL database');
});

// Use pool.query() instead of db.query() throughout the code

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
