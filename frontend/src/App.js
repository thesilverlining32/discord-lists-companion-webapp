// src/Auth.js

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './components/Auth/Login';
import AuthCallback from './components/Auth/AuthCallback';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const App = () => {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <Header />
          <main>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/login" component={Login} />
              <Route path="/auth/callback" component={AuthCallback} />
              <ProtectedRoute path="/dashboard" component={Dashboard} />
              <ProtectedRoute path="/profile" component={Profile} />
            </Switch>
          </main>
          <Footer />
        </div>
      </Router>
    </UserProvider>
  );
};

export default App;
