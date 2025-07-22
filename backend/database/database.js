// backend/database/database.js
// This module provides a centralized connection to the SQLite database.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const util = require('util');

// --- NEW: Define a separate data directory for the persistent disk ---
// This ensures the database file is stored on the persistent disk and not
// in the source code directory, which gets overwritten on deploys.
const dataDir = path.resolve(__dirname, '..', '..', 'data');

// Ensure the data directory exists (it might not on first run locally).
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// The database file will now be located inside the 'data' directory.
const dbPath = path.join(dataDir, 'blox_battles.db');

// Create a new database connection object.
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('FATAL: Could not connect to database.', err.message);
        process.exit(1);
    } else {
        console.log('Successfully connected to the SQLite database at:', dbPath);
    }
});

// Centralize promisification and add serialization.
const dbWrapper = {
    get: util.promisify(db.get.bind(db)),
    all: util.promisify(db.all.bind(db)),
    run: util.promisify(db.run.bind(db)),
    instance: db
};

// Use serialize to ensure that database queries are executed sequentially.
db.serialize(() => {
    db.run("PRAGMA journal_mode = WAL;");
});

module.exports = dbWrapper;
