import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListItem from './ListItem';

const List = () => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists`)
      .then(response => {
        setLists(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the lists!', error);
      });
  }, []);

  const handleAddList = () => {
    console.log("Button clicked, adding list:", listName);
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists`, { name: listName })
      .then(response => {
        console.log("List added:", response.data);
        setLists([...lists, response.data]);
        setListName('');
      })
      .catch(error => {
        console.error('There was an error creating the list!', error);
      });
  };

  return (
    <div>
      <h1>Lists</h1>
      <input
        type="text"
        value={listName}
        onChange={e => setListName(e.target.value)}
        placeholder="New list name"
      />
      <button onClick={handleAddList}>Add List</button>
      <ul>
        {lists.map(list => (
          <li key={list._id}>
            <h2>{list.name}</h2>
            {/* Display the list items */}
            <ListItem listId={list._id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default List;
