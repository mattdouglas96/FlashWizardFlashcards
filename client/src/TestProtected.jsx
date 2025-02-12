// TestProtected.jsx
import React, { useState, useEffect } from 'react';

const TestProtected = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const testProtectedRoute = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found - please login first');
            }

            const response = await fetch('http://localhost:8081/protected', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to access protected route');
            }

            setMessage(data.message);
            setError('');
        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the JWT token
        setMessage('');
        setError('Logged out successfully');
    };

    return (
        <div>
            <button onClick={testProtectedRoute} className="btn btn-primary">
                Test Protected Route
            </button>
            <button onClick={handleLogout} className="btn btn-danger">
                Logout
            </button>
            {message && <div className="alert alert-success mt-3">{message}</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
    );
};

export default TestProtected;