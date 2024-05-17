import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ListItem from './ListItem';

const List = () => {
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState('');

  useEffect(() => {
    // Fetch the lists from the backend when the component mounts
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lists`)
      .then(response => {
        // Log the response to debug
        console.log('API response:', response.data);

        // Ensure the data is an array before setting it to state
        if (Array.isArray(response.data)) {
          setLists(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the lists!', error);
      });
  }, []);

  const handleAddList = () => {
    // Log the request data to debug
    console.log('Creating list with name:', listName);

    // Add a new list by making a POST request to the backend
    axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lists`, { name: listName })
      .then(response => {
        // Update the state to include the new list
        if (response.data) {
          setLists([...lists, response.data]);
        } else {
          console.error('Expected an object but got:', response.data);
        }
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
        {Array.isArray(lists) ? (
          lists.map(list => (
            <li key={list._id}>
              <h2>{list.name}</h2>
              {/* Display the list items */}
              <ListItem listId={list._id} />
            </li>
          ))
        ) : (
          <p>No lists available</p>
        )}
      </ul>
    </div>
  );
};

export default List;
