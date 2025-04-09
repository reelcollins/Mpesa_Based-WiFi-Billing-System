const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the SQL commands
    await pool.query(schema);
    console.log('✅ Database schema created successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

setupDatabase(); 