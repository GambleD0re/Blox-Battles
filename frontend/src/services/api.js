// frontend/src/services/api.js
// Version: 4
// This version removes the updateNotificationPreference function.

import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// --- AUTHENTICATION ---
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);

// --- USER & DASHBOARD ---
export const getDashboardData = () => API.get('/user-data');
export const verifyRobloxAccount = (robloxUsername) => API.post('/roblox/verify', { robloxUsername });
export const getInbox = () => API.get('/inbox');
export const getTransactionHistory = () => API.get('/history');

// --- DUELS & DISPUTES ---
export const getDuelHistory = () => API.get('/duels/history');
export const getDetailedDuelHistory = () => API.get('/duel-history');
export const findPlayer = (robloxUsername) => API.get(`/duels/find-player?roblox_username=${encodeURIComponent(robloxUsername)}`);
export const sendChallenge = (challengeData) => API.post('/duels/challenge', challengeData);
export const respondToDuel = (responseData) => API.post('/duels/respond', responseData);
export const cancelDuel = (duelId) => API.delete(`/duels/cancel/${duelId}`);
export const getTranscript = (duelId) => API.get(`/duels/transcript/${duelId}`);
export const startDuel = (duelId) => API.post(`/duels/${duelId}/start`);
export const forfeitDuel = (duelId) => API.post(`/duels/${duelId}/forfeit`);
export const getUnseenResults = () => API.get('/duels/unseen-results');
export const confirmDuelResult = (duelId) => API.post(`/duels/${duelId}/confirm-result`);
export const fileDispute = (duelId, disputeData) => API.post(`/duels/${duelId}/dispute`, disputeData);

// --- STATIC DATA ---
export const getGameData = () => API.get('/gamedata');

// --- SYSTEM STATUS ---
export const getBotStatus = () => API.get('/status');

// --- PAYMENTS & PAYOUTS ---
export const createCheckoutSession = (packageId) => API.post('/payments/create-checkout-session', { packageId });
export const getCryptoDepositAddress = () => API.get('/payments/crypto-address');
export const getCryptoQuote = (packageId, tokenType) => API.post('/payments/crypto-quote', { packageId, tokenType });
export const requestCryptoWithdrawal = (gemAmount, recipientAddress, tokenType) => API.post('/payouts/request-crypto', { gemAmount, recipientAddress, tokenType });
export const cancelWithdrawalRequest = (requestId) => API.post(`/payouts/cancel-request/${requestId}`);
export const updateWithdrawalDetails = (requestId, details) => API.put(`/payouts/update-request/${requestId}`, details);

// --- SETTINGS ---
export const updatePassword = (passwordData) => API.put('/user/password', passwordData);
export const unlinkRoblox = () => API.post('/user/unlink/roblox');
export const deleteAccount = (password) => API.delete('/user/delete/account', { data: { password } });
// REMOVED: updateNotificationPreference function is no longer needed.

// --- ADMIN ---
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminLogs = () => API.get('/admin/logs');
export const getAdminUsers = (searchQuery, status) => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (status) params.append('status', status);
    return API.get(`/admin/users?${params.toString()}`);
};
export const updateUserGems = (userId, amount) => API.post(`/admin/users/${userId}/gems`, { amount });
export const banUser = (userId, reason, duration_hours) => API.post(`/admin/users/${userId}/ban`, { reason, duration_hours });
export const unbanUser = (userId) => API.delete(`/admin/users/${userId}/ban`);
export const deleteUserAccount = (userId) => API.delete(`/admin/users/${userId}`);
export const getAdminServers = () => API.get('/admin/servers');
export const addAdminServer = (serverData) => API.post('/admin/servers', serverData);
export const deleteAdminServer = (serverId) => API.delete(`/admin/servers/${serverId}`);
export const getPendingDisputes = () => API.get('/admin/disputes');
export const resolveDispute = (disputeId, resolutionType) => API.post(`/admin/disputes/${disputeId}/resolve`, { resolutionType });
export const getAdminPayoutRequests = () => API.get('/admin/payout-requests');
export const getAdminUserDetailsForPayout = (userId, payoutId) => API.get(`/admin/users/${userId}/details-for-payout/${payoutId}`);
export const approvePayoutRequest = (requestId) => API.post(`/admin/payout-requests/${requestId}/approve`);
export const declinePayoutRequest = (requestId, reason) => API.post(`/admin/payout-requests/${requestId}/decline`, { reason });

export default API;
