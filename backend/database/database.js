// backend/database/database.js
const pgp = require('pg-promise')();
require('dotenv').config();

// Configuration object for the database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bloxbattles',
  user: process.env.DB_USER || 'bloxbattles_user',
  password: process.env.DB_PASSWORD || 'password',
};

// Render provides a DATABASE_URL environment variable
// which includes the necessary SSL configuration.
// We check if we are in a production environment (like Render)
// and use the DATABASE_URL if it exists.
const isProduction = process.env.NODE_ENV === 'production';

// Connection string for Render's PostgreSQL
const connectionString = process.env.DATABASE_URL;

// Initialize the database connection
// For production, we use the connection string which includes SSL settings.
// For development, we use the local configuration object.
const db = pgp(isProduction ? {
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Render's managed database
  }
} : dbConfig);


console.log('Database connection configured.');
if (isProduction) {
  console.log('Running in production mode, using DATABASE_URL.');
} else {
  console.log('Running in development mode, using local dbConfig.');
}

module.exports = db;
