// backend/server.js
// Version: 2
// This version ensures the subscriptions route remains disabled.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/database');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.SERVER_URL,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const duelRoutes = require('./routes/duels');
const paymentRoutes = require('./routes/payments');
const payoutRoutes = require('./routes/payouts');
const adminRoutes = require('./routes/admin');
const statusRoutes = require('./routes/status');
const gameDataRoutes = require('./routes/gameData');
const historyRoutes = require('./routes/history');
const duelHistoryRoutes = require('./routes/duelHistory');
const inboxRoutes = require('./routes/inbox');
const logRoutes = require('./routes/logs');
const taskRoutes = require('./routes/tasks');
// const subscriptionRoutes = require('./routes/subscriptions'); // This line remains commented out.

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', duelRoutes);
app.use('/api', paymentRoutes);
app.use('/api', payoutRoutes);
app.use('/api', adminRoutes);
app.use('/api', statusRoutes);
app.use('/api', gameDataRoutes);
app.use('/api', historyRoutes);
app.use('/api', duelHistoryRoutes);
app.use('/api', inboxRoutes);
app.use('/api', logRoutes);
app.use('/api', taskRoutes);
// app.use('/api', subscriptionRoutes); // This line remains commented out.


// Serve frontend for production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
