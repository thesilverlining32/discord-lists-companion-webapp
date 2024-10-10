import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getList } from '../../services/api';
import './ListDetail.css';

const ListDetail = () => {
  const { listId } = useParams();
  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        setIsLoading(true);
        const response = await getList(listId);
        setList(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch list details. Please try again.');
        console.error('Error fetching list:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [listId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!list) return <div>List not found</div>;

  return (
    <div className="list-detail">
      <h2>{list.name}</h2>
      <p>{list.description}</p>
      <h3>Items:</h3>
      {list.items && list.items.length > 0 ? (
        <ul className="list-items">
          {list.items.map((item) => (
            <li key={item.id} className="list-item">
              <h4>{item.title}</h4>
              <p>{item.description}</p>
              <p>Type: {item.type}</p>
              {item.rating && <p>Rating: {item.rating}/5</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No items in this list yet.</p>
      )}
    </div>
  );
};

export default ListDetail;
