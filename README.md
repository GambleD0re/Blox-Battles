Here's a summary of the application's key aspects:

1. Core Functionality:

User Accounts: Users can sign up with email/password or Google, and link their Roblox accounts for in-game interactions.

Duel System: Players can challenge each other to duels with a set "wager" of Gems, select maps, and ban weapons.

Automated Refereeing: A Roblox bot monitors duels, logs events (like eliminations and loadout changes), and automatically determines duel outcomes, including forfeits due to banned items.

Dispute Resolution: Users can dispute duel results, which are then reviewed by administrators.

Gem Economy: Users can deposit Gems using credit cards (Stripe) or cryptocurrency (USDC, USDT, POL on Polygon network), and request crypto withdrawals.

User Management: Admins can manage users, adjust gem balances, ban/unban, and terminate accounts.

Notifications & History: Users receive notifications in an inbox and can view detailed duel and transaction histories.

Leaderboard: A leaderboard tracks top players by wins.

2. Technology Stack:

Frontend: React.js, Vite for bundling, Tailwind CSS for styling.

Backend: Node.js with Express.js.

Database: PostgreSQL (with pg-promise) for production, SQLite3 for development.

Authentication: JWT for session management and Passport.js with Google OAuth2.0 strategy.

Payment Processing: Stripe for credit card payments.

Cryptocurrency Integration: Ethers.js and Alchemy SDK for interacting with the Polygon blockchain for crypto deposits and payouts; Chainlink Price Feeds for real-time crypto-to-USD conversion.

Roblox Bot: A Lua-based script that interacts with the Roblox game to manage duels and report events to the backend.

The application is deployed using Render, with separate services for the API (Node/Express) and the static frontend (React/Vite).
