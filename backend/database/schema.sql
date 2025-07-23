-- backend/database/schema.sql
-- Version: 1
-- This version removes the notifications_enabled column from the users table
-- and deletes the push_subscriptions table to remove the notification feature.

-- Drop tables if they exist to ensure a clean slate on re-initialization.
DROP TABLE IF EXISTS duel_participants, duel_results, disputes, transactions, duels, users, game_servers, payout_requests, push_subscriptions CASCADE;

-- Users Table: Stores core user information.
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    roblox_user_id VARCHAR(255) UNIQUE,
    roblox_username VARCHAR(255),
    balance DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    role VARCHAR(10) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_expires_at TIMESTAMP WITH TIME ZONE
    -- REMOVED: notifications_enabled column
);

-- Duels Table: Stores information about each duel.
CREATE TABLE duels (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL, -- e.g., 'pending', 'accepted', 'active', 'completed', 'disputed'
    wager_amount DECIMAL(12, 2) NOT NULL,
    winner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Duel Participants Table: Links users to duels.
CREATE TABLE duel_participants (
    duel_id INTEGER NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- 'challenger' or 'opponent'
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY (duel_id, user_id)
);

-- Transactions Table: Logs all balance changes.
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'duel_wager', 'duel_win'
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed'
    related_duel_id INTEGER REFERENCES duels(id),
    external_tx_id VARCHAR(255), -- For Stripe or Crypto transactions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game Servers Table: Stores information about active bot instances.
CREATE TABLE game_servers (
    id SERIAL PRIMARY KEY,
    server_id VARCHAR(255) UNIQUE NOT NULL,
    region VARCHAR(100),
    last_heartbeat TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Payout Requests Table: Manages user withdrawal requests.
CREATE TABLE payout_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_gems DECIMAL(12, 2) NOT NULL,
    amount_usd DECIMAL(12, 2),
    recipient_address VARCHAR(255) NOT NULL,
    token_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'declined', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disputes Table: Manages user-filed disputes for duels.
CREATE TABLE disputes (
    id SERIAL PRIMARY KEY,
    duel_id INTEGER NOT NULL REFERENCES duels(id) ON DELETE CASCADE,
    filing_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved'
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_users_roblox_id ON users(roblox_user_id);
CREATE INDEX idx_duels_status ON duels(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- REMOVED: The push_subscriptions table is no longer needed.
