// backend/middleware/auth.js
// Version: 1
// This file contains middleware functions for authentication and authorization.

const jwt = require('jsonwebtoken');
const db = require('../database/database');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    // REMOVED: The check for the admin test API key has been removed for security.
    
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const { rows } = await db.query('SELECT role FROM users WHERE id = $1', [decoded.userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userRole = rows[0].role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Not an admin.' });
        }
        
        req.user = decoded; // Attach user info to the request object
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};


module.exports = {
    authenticateToken,
    isAdmin,
};
