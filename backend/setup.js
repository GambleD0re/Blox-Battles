// backend/setup.js
// This script initializes the database from the schema.sql file.

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// --- Configuration ---
// The data directory is where the persistent disk will be mounted on Render.
// It's separate from the source code to prevent files from being overwritten.
const dataDir = path.resolve(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'blox_battles.db');

// The schema file stays with the source code.
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

// --- Main Setup Function ---
function setupDatabase() {
    // Ensure the data directory for the database exists.
    if (!fs.existsSync(dataDir)) {
        console.log(`   - Data directory not found. Creating at: ${dataDir}`);
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if the database file already exists in the data directory.
    if (fs.existsSync(dbPath)) {
        console.log('✅ Database file already exists in the data directory. Setup is not required.');
        return;
    }

    console.log('🚀 Database not found. Starting initialization...');

    // Create a new database connection in the data directory.
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Could not create the database file:', err.message);
            return;
        }
        console.log('   - Successfully created database file at:', dbPath);

        // Read the schema.sql file from its source location.
        fs.readFile(schemaPath, 'utf8', (err, sql) => {
            if (err) {
                console.error('❌ Could not read the schema.sql file:', err.message);
                db.close();
                return;
            }

            console.log('   - Successfully read schema.sql file.');

            // Execute the SQL script to create the tables.
            db.exec(sql, (err) => {
                if (err) {
                    console.error('❌ Error executing schema:', err.message);
                } else {
                    console.log('   - Successfully executed schema and created tables.');
                    console.log('✅ Database setup complete!');
                }

                // Close the database connection.
                db.close((err) => {
                    if (err) {
                        console.error('❌ Error closing the database:', err.message);
                    } else {
                        console.log('   - Database connection closed.');
                    }
                });
            });
        });
    });
}

// --- Run the Setup ---
setupDatabase();
