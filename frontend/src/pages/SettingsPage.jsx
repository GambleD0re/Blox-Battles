// frontend/src/pages/SettingsPage.jsx
// Version: 1
// This version removes the UI and logic for notification preferences.

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { updatePassword, unlinkRoblox, deleteAccount } from '../services/api';

const SettingsPage = () => {
    const { user, logout } = useContext(AuthContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (newPassword !== confirmPassword) {
            setError("New passwords don't match.");
            return;
        }
        try {
            const res = await updatePassword({ currentPassword, newPassword });
            setMessage(res.data.message);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        }
    };

    const handleUnlinkRoblox = async () => {
        if (window.confirm('Are you sure you want to unlink your Roblox account?')) {
            try {
                await unlinkRoblox();
                setMessage('Roblox account unlinked successfully.');
                // You might need to refresh user context here
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to unlink Roblox account.');
            }
        }
    };

    const handleDeleteAccount = async () => {
        const confirmation = prompt('This action is irreversible. To confirm, please type your password:');
        if (confirmation !== null) {
            try {
                await deleteAccount(confirmation);
                alert('Your account has been successfully deleted.');
                logout();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete account. Password may be incorrect.');
            }
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4 text-white">
            <h1 className="text-3xl font-bold mb-6">Settings</h1>

            {message && <div className="bg-green-500 text-white p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-500 text-white p-3 rounded mb-4">{error}</div>}

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange}>
                    {/* Form fields for password change */}
                </form>
            </div>

            {/* REMOVED: The section for notification settings is no longer needed. */}

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Account Actions</h2>
                <div className="space-y-4">
                    {user.roblox_username && (
                        <button
                            onClick={handleUnlinkRoblox}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                        >
                            Unlink Roblox Account ({user.roblox_username})
                        </button>
                    )}
                    <button
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
