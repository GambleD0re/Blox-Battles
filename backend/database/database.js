// backend/database/database.js
const pgp = require('pg-promise')();
require('dotenv').config();

// This configuration is now designed for PostgreSQL.
// When deployed on Render, the DATABASE_URL environment variable
// will be provided automatically and will include the necessary SSL configuration.

const isProduction = process.env.NODE_ENV === 'production';

// Render provides a DATABASE_URL environment variable for its managed PostgreSQL.
// For local development, you can set up a local PostgreSQL instance and create
// a .env file with a similar DATABASE_URL variable.
// Example .env line: DATABASE_URL=postgres://user:password@localhost:5432/bloxbattles
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set. Please configure it in your .env file for local development or in your hosting environment.');
}

const dbConfig = {
  connectionString,
  // In production (like on Render), it's often necessary to require SSL.
  // Render's DATABASE_URL includes the sslmode=require parameter.
  // For local setups that don't use SSL, you can conditionally add this.
  ...(isProduction && { ssl: { rejectUnauthorized: false } }),
};

const db = pgp(dbConfig);

console.log('Database connection configured for PostgreSQL.');
if (isProduction) {
  console.log('Running in production mode, using DATABASE_URL with SSL.');
} else {
  console.log('Running in development mode, using DATABASE_URL from .env file.');
}

// Test the connection
db.connect()
  .then(obj => {
    obj.done(); // success, release connection
    console.log('Successfully connected to PostgreSQL database.');
  })
  .catch(error => {
    console.error('ERROR connecting to PostgreSQL database:', error.message);
  });


module.exports = db;
