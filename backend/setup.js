// backend/setup.js
// This script initializes the database from the schema.sql file.
// It's designed to be run once to set up the application's database structure.

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// --- Configuration ---
const dbPath = path.join(__dirname, 'database', 'blox_battles.db');
const schemaPath = path.join(__dirname, 'database', 'schema.sql');

// --- Main Setup Function ---
function setupDatabase() {
    // Check if the database file already exists.
    if (fs.existsSync(dbPath)) {
        console.log('✅ Database file already exists. Setup is not required.');
        console.log('   To re-initialize, please delete the existing blox_battles.db file.');
        return;
    }

    console.log('🚀 Database not found. Starting initialization...');

    // Create a new database connection.
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Could not create the database file:', err.message);
            return;
        }
        console.log('   - Successfully created database file at:', dbPath);

        // Read the schema.sql file.
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
