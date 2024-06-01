import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getItems, createItem, updateItem, deleteItem } from '../services/api';

const List = () => {
    const { id } = useParams();
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        rating: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchItems();
    }, [id]);

    const fetchItems = async () => {
        const response = await getItems(id);
        setItems(response.data);
    };

    const handleCreateItem = async () => {
        await createItem(id, newItem);
        setNewItem({ title: '', description: '', rating: '', imageUrl: '' });
        fetchItems();
    };

    const handleDeleteItem = async (itemId) => {
        await deleteItem(id, itemId);
        fetchItems();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewItem({ ...newItem, [name]: value });
    };

    return (
        <div>
            <h1>List Items</h1>
            <input
                type="text"
                name="title"
                value={newItem.title}
                onChange={handleInputChange}
                placeholder="Title"
            />
            <input
                type="text"
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                placeholder="Description"
            />
            <input
                type="text"
                name="rating"
                value={newItem.rating}
                onChange={handleInputChange}
                placeholder="Rating"
            />
            <input
                type="text"
                name="imageUrl"
                value={newItem.imageUrl}
                onChange={handleInputChange}
                placeholder="Image URL"
            />
            <button onClick={handleCreateItem}>Add Item</button>
            <ul>
                {items.map(item => (
                    <li key={item._id}>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                        <p>Rating: {item.rating}</p>
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100px' }} />
                        <button onClick={() => handleDeleteItem(item._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default List;
