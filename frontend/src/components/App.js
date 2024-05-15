import React, { useState, useEffect } from 'react';
import axios from 'axios';
import List from './List';

function App() {
    const [lists, setLists] = useState([]);

    useEffect(() => {
        axios.get('/api/lists').then(response => {
            setLists(response.data);
        });
    }, []);

    return (
        <div>
            <h1>Lists</h1>
            {lists.map(list => (
                <List key={list._id} list={list} />
            ))}
        </div>
    );
}

export default App;
