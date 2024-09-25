// src/components/Auth/Login.js

import React, { useState } from 'react';
import { loginWithDiscord } from '../../services/auth';

const Login = () => {
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await loginWithDiscord();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Failed to initiate login. Please try again.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login with Discord</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

export default Login;
