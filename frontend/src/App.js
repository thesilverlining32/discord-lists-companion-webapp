import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Login from './components/Login';
import Protected from './components/Protected';
import Callback from './components/Callback';

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/protected">Protected Route</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/protected">
            <Protected />
          </Route>
          <Route path="/">
            <h1>Welcome to Idea List App</h1>
          </Route>
          <Route path="/callback">
            <Callback />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
