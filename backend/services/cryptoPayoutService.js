// backend/services/cryptoPayoutService.js
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const db = require('../database/database');
const { getMaticPrice } = require('./priceFeedService');

// --- Configuration ---
const ALCHEMY_POLYGON_URL = process.env.ALCHEMY_POLYGON_URL;
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_POLYGON_URL);

// --- [SECURE] Hot Wallet Private Key Handling ---
// The private key is no longer read from a standard environment variable.
// Instead, we read it from a file path specified by an environment variable.
// Render's "Secret File" feature will create this file for us at the specified path.
const PAYOUT_WALLET_PRIVATE_KEY_PATH = process.env.PAYOUT_WALLET_PRIVATE_KEY_PATH;
let payoutWallet;

if (!PAYOUT_WALLET_PRIVATE_KEY_PATH) {
    console.error("FATAL: PAYOUT_WALLET_PRIVATE_KEY_PATH environment variable is not set.");
    // In a real scenario, you might want to prevent the app from starting.
} else {
    try {
        // Read the private key from the secure file.
        const privateKey = fs.readFileSync(PAYOUT_WALLET_PRIVATE_KEY_PATH, 'utf8').trim();
        payoutWallet = new ethers.Wallet(privateKey, provider);
        console.log("Successfully loaded payout wallet from secure path. Address:", payoutWallet.address);
    } catch (error) {
        console.error("FATAL: Could not read private key from file path:", PAYOUT_WALLET_PRIVATE_KEY_PATH, error);
        // Prevent the application from running without a valid wallet.
        payoutWallet = null;
    }
}


// Mock ERC20 ABI for interacting with stablecoin contracts (USDC, USDT)
const erc20Abi = [
    "function transfer(address to, uint256 amount)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// Polygon Mainnet addresses for common stablecoins
const TOKEN_ADDRESSES = {
    'USDC': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    'USDT': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
};

/**
 * Executes a payout to a user's specified crypto address.
 * @param {number} userId - The ID of the user requesting the payout.
 * @param {string} destinationAddress - The destination wallet address.
 * @param {number} amountGems - The amount of gems to be paid out.
 * @param {string} tokenSymbol - The symbol of the token to pay out (e.g., 'USDC').
 * @returns {Promise<string>} The transaction hash of the successful payout.
 */
async function executePayout(userId, destinationAddress, amountGems, tokenSymbol = 'USDC') {
    if (!payoutWallet) {
        throw new Error("Payout wallet is not initialized. Cannot process payouts.");
    }
    if (!ethers.utils.isAddress(destinationAddress)) {
        throw new Error("Invalid destination address provided.");
    }
    if (!TOKEN_ADDRESSES[tokenSymbol]) {
        throw new Error(`Unsupported token symbol: ${tokenSymbol}`);
    }

    const tokenAddress = TOKEN_ADDRESSES[tokenSymbol];
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, payoutWallet);
    const decimals = await tokenContract.decimals();

    // Assuming 1 gem = $0.01 (1 cent)
    const amountUSD = amountGems / 100;
    const amountTokens = ethers.utils.parseUnits(amountUSD.toString(), decimals);

    console.log(`Processing payout for user ${userId}:`);
    console.log(`  - Gems: ${amountGems}`);
    console.log(`  - USD Value: $${amountUSD.toFixed(2)}`);
    console.log(`  - Token: ${tokenSymbol}`);
    console.log(`  - Destination: ${destinationAddress}`);
    console.log(`  - Amount in token units (${decimals} decimals): ${amountTokens.toString()}`);


    // Check if the hot wallet has sufficient balance
    const balance = await tokenContract.balanceOf(payoutWallet.address);
    if (balance.lt(amountTokens)) {
        console.error(`Insufficient funds in payout wallet for ${tokenSymbol}.`);
        console.error(`  - Required: ${amountTokens.toString()}`);
        console.error(`  - Available: ${balance.toString()}`);
        // Here you would trigger an alert to the platform administrators.
        throw new Error("Insufficient funds in the payout wallet to process this transaction. The team has been notified.");
    }

    // Estimate gas price
    const gasPrice = await provider.getGasPrice();
    
    // Execute the transfer
    const tx = await tokenContract.transfer(destinationAddress, amountTokens, {
        gasPrice: gasPrice.mul(12).div(10) // Add 20% buffer to gas price
    });

    console.log(`Payout transaction sent. Hash: ${tx.hash}`);
    
    // Wait for the transaction to be mined
    await tx.wait();
    console.log(`Payout transaction confirmed. Hash: ${tx.hash}`);

    return tx.hash;
}

module.exports = { executePayout };
