// src/components/Auth/Login.js

import React from 'react';
import { loginWithDiscord } from '../../services/auth';

const Login = () => {
  const handleLogin = async () => {
    try {
      await loginWithDiscord();
    } catch (error) {
      console.error('Login failed:', error);
      // Handle error (e.g., show an error message to the user)
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login with Discord</button>
    </div>
  );
};

export default Login;
