import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLists, createList, deleteList } from '../services/api';

const Dashboard = () => {
    const [lists, setLists] = useState([]);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        const response = await getLists();
        setLists(response.data);
    };

    const handleCreateList = async () => {
        await createList({ name: newListName });
        setNewListName('');
        fetchLists();
    };

    const handleDeleteList = async (id) => {
        await deleteList(id);
        fetchLists();
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="New list name"
            />
            <button onClick={handleCreateList}>Create List</button>
            <ul>
                {lists.map(list => (
                    <li key={list._id}>
                        <Link to={`/list/${list._id}`}>{list.name}</Link>
                        <button onClick={() => handleDeleteList(list._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
