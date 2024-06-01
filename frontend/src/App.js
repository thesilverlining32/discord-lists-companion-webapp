import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import List from './pages/List';
import Login from './pages/Login';

function App() {
    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');
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
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route path="/login" component={Login} />
                    <PrivateRoute path="/dashboard" component={Dashboard} />
                    <PrivateRoute path="/list/:id" component={List} />
                </Switch>
            </div>
        </Router>
    );
}

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            isAuthenticated() ? (
                <Component {...props} />
            ) : (
                <Redirect to="/login" />
            )
        }
    />
);

export default App;
