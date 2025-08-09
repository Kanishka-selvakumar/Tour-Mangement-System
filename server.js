const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const bcrypt = require('bcryptjs'); // Needed for password hashing

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Endpoint for getting all tour packages or searching
app.get('/api/packages', (req, res) => {
    let sql = 'SELECT * FROM packages';
    let params = [];
    const { query } = req.query;

    if (query) {
        sql += ' WHERE name LIKE ? OR description LIKE ?';
        const searchParam = `%${query}%`;
        params = [searchParam, searchParam];
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(400).json({ "error": err.message });
        }
        res.json(rows);
    });
});

// API Endpoint for User Registration (Signup)
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password.' });
        }

        const sql = 'INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)';
        db.run(sql, [firstName, lastName, email, phone, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed: users.email')) {
                    return res.status(409).json({ message: 'Email already exists.' });
                }
                return res.status(500).json({ message: err.message });
            }
            res.status(201).json({ message: 'User registered successfully!', userId: this.lastID });
        });
    });
});

// API Endpoint for User Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.get(sql, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords.' });
            }
            if (isMatch) {
                res.status(200).json({ message: 'Login successful!', user: { id: user.id, email: user.email, firstName: user.firstName } });
            } else {
                res.status(401).json({ message: 'Invalid email or password.' });
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});