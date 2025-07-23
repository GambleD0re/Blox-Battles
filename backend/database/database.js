// =================================================================
//        Blox Battles Database Configuration (Corrected for Render)
// =================================================================
//
// This file configures the connection to the PostgreSQL database.
// It has been modified to work seamlessly with Render's environment.
//

const { Pool } = require('pg');

// --- RENDER DEPLOYMENT MODIFICATION ---
//
// Original Logic (Commented Out):
// The previous logic constructed the connection string from multiple
// individual .env variables (DB_USER, DB_HOST, etc.). This is common
// for local development but not ideal for cloud platforms.
//
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });
//
// Corrected Logic:
// Render provides a single, complete connection string via the `DATABASE_URL`
// environment variable. We use this directly. The `render.yaml` file
// ensures this variable is available to the backend service.
//
// The `ssl` configuration is crucial for connecting to managed cloud
// databases like Render's, which often require SSL connections.
// `rejectUnauthorized: false` is a common setting for this context,
// though for higher security needs, one might configure it with a CA certificate.
//
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the database connection on startup.
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself for more complex transactions if needed
};
