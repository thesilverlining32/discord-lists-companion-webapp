import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import List from './pages/List';
import Login from './pages/Login';

function App() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState(null, null, window.location.pathname);
        }
    }, []);

    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/list/:id" element={isAuthenticated() ? <List /> : <Navigate to="/login" />} />
                    {/* Catch-all route to handle undefined routes */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
