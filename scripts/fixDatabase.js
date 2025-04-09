const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: { rejectUnauthorized: false }
});

async function fixDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Creating payments table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(15) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_id VARCHAR(50) NOT NULL UNIQUE,
        mac_address VARCHAR(17) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Creating admins table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Creating update_updated_at_column function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `);
    
    console.log('Creating trigger...');
    await client.query(`
      DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
      CREATE TRIGGER update_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('Database tables created successfully!');
    client.release();
    console.log('Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
}

fixDatabase(); 