const bcrypt = require("bcryptjs");
const { Pool } = require('pg');
require('dotenv').config();

// Admin credentials to add
const email = "admin@example.com";  // Change this
const password = "admin123";        // Change this

// Connect to PostgreSQL database
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log(`Creating admin account with email: ${email}`);
    
    // Insert admin into database
    const result = await client.query(
      'INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    
    console.log(`Admin created successfully with ID: ${result.rows[0].id}`);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin(); 