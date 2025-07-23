// backend/routes/users.js
// Version: 2
// This version fixes a startup crash by replacing calls to a
// non-existent 'userController' with inline route handlers.

const express = require('express');
const router = express.Router();
const db = require('../database/database');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');

// --- User Profile & Data ---
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, username, email, roblox_user_id, roblox_username, balance, created_at, role FROM users WHERE id = $1', [req.user.userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- Settings Page Routes ---

// PUT route for updating user password
router.put('/password', authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    try {
        const { rows } = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// This route was removed as the feature was deprecated.
// router.put('/notification-preference', ...);

router.post('/unlink/roblox', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        await db.query('UPDATE users SET roblox_user_id = NULL, roblox_username = NULL WHERE id = $1', [userId]);
        res.json({ message: 'Roblox account unlinked successfully.' });
    } catch (error) {
        console.error('Error unlinking Roblox account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/delete/account', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        res.json({ message: 'Account deleted successfully.' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
