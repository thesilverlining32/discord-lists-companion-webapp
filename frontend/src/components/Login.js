import React from 'react';
import axios from 'axios';

function Login() {
  const handleLogin = async () => {
    try {
      const response = await axios.get('https://your-backend-url/auth/login');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <button onClick={handleLogin}>Login with Discord</button>
    </div>
  );
}

export default Login;
