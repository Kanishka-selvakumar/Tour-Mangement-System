const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'tourism.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create the packages table if it doesn't exist
        db.run('DROP TABLE IF EXISTS packages');
        db.run(`
            CREATE TABLE packages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price TEXT NOT NULL,
                image TEXT
            )
        `, (err) => {
            if (err) {
                console.error('Error creating packages table:', err.message);
            } else {
                console.log('Packages table created or already exists. Populating with data...');

                const tourPackages = [
                    { name: 'Enchanting Kerala', description: 'Explore the serene backwaters and lush tea plantations of Kerala.', price: '₹15,000', image: 'https://placehold.co/600x400/22c55e/ffffff?text=Kerala' },
                    { name: 'Royal Rajasthan', description: 'A majestic journey through the forts and palaces of Rajasthan.', price: '₹22,000', image: 'https://placehold.co/600x400/c026d3/ffffff?text=Rajasthan' },
                    { name: 'Himalayan Adventure', description: 'Thrilling treks and breathtaking views in the Himalayan mountains.', price: '₹30,000', image: 'https://placehold.co/600x400/3b82f6/ffffff?text=Himalayas' },
                    { name: 'Golden Triangle', description: 'Visit Delhi, Agra, and Jaipur in this classic Indian tour.', price: '₹18,000', image: 'https://placehold.co/600x400/f59e0b/ffffff?text=Golden+Triangle' },
                    { name: 'Goa Beaches', description: 'Relax and party on the sun-kissed beaches of Goa.', price: '₹12,000', image: 'https://placehold.co/600x400/ef4444/ffffff?text=Goa' },
                    { name: 'Spiritual Varanasi', description: 'Experience the ancient city and ghats of Varanasi.', price: '₹10,000', image: 'https://placehold.co/600x400/94a3b8/ffffff?text=Varanasi' }
                ];

                const insert = db.prepare('INSERT INTO packages (name, description, price, image) VALUES (?, ?, ?, ?)');
                tourPackages.forEach(pkg => {
                    insert.run(pkg.name, pkg.description, pkg.price, pkg.image);
                });
                insert.finalize();
            }
        });

        // Create the users table for login and signup
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating users table:', err.message);
            } else {
                console.log('Users table created or already exists.');
            }
        });
    }
});

module.exports = db;