// backend/routes/auth.js
const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const db = require('../database/database');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

// Passport configuration for Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${SERVER_URL}/api/auth/google/callback` // Use the environment variable
  },
  async (accessToken, refreshToken, profile, done) => {
    const { id, displayName, emails, photos } = profile;
    const email = emails[0].value;
    const avatarUrl = photos[0].value;

    try {
      let user = await db.oneOrNone('SELECT * FROM users WHERE google_id = $1', [id]);

      if (user) {
        // If user exists, update their avatar if it has changed
        if (user.avatar_url !== avatarUrl) {
          await db.none('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, user.id]);
        }
        return done(null, user);
      } else {
        // If user does not exist, create a new one
        const newUser = await db.one(
          'INSERT INTO users (google_id, username, email, avatar_url, gems) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [id, displayName, email, avatarUrl, 0] // Start new users with 0 gems
        );
        return done(null, newUser);
      }
    } catch (error) {
      console.error('Error in Google OAuth strategy:', error);
      return done(error, null);
    }
  }
));

// Route to initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    // On successful authentication, create a JWT
    const user = req.user;
    const token = jwt.sign({
      id: user.id,
      username: user.username,
      isAdmin: user.is_admin,
      isModerator: user.is_moderator,
    }, JWT_SECRET, { expiresIn: '7d' });

    // Redirect user to the frontend with the token
    res.redirect(`${SERVER_URL}/dashboard?token=${token}`);
  }
);

// Route to verify a JWT token from the client
router.get('/verify', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token.' });
        }
        res.status(200).json({ message: 'Token is valid.', user: decoded });
    });
});

module.exports = router;
