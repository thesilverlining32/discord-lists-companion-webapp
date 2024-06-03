import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import List from './pages/List';
import Login from './pages/Login';

function App() {
    const [isAuthenticating, setIsAuthenticating] = useState(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        console.log('Token from URL:', token);
        if (token) {
            localStorage.setItem('token', token);
            window.history.replaceState(null, null, window.location.pathname);
            console.log('Token stored in localStorage:', localStorage.getItem('token'));
        }
        setIsAuthenticating(false);
    }, []);

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        console.log('Token in isAuthenticated:', token);
        return token !== null;
    };

    if (isAuthenticating) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" />} />
                    <Route path="/list/:id" element={isAuthenticated() ? <List /> : <Navigate to="/login" />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
