import React from 'react';

const Login = () => {
    const handleLogin = () => {
        window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/discord`;
    };

    return (
        <div>
            <h1>Login</h1>
            <button onClick={handleLogin}>Login with Discord</button>
        </div>
    );
};

export default Login;
