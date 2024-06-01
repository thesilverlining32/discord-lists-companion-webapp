import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
    <div>
        <h1>Welcome to the List Manager</h1>
        <p>
            <Link to="/login">Login with Discord</Link>
        </p>
    </div>
);

export default Home;
