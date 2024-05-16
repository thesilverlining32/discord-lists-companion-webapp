import React from 'react';

function ListItem({ item }) {
  return (
    <li>
      {item.content} <br />
      <small>Created by: {item.createdBy.username}</small>
    </li>
  );
}

export default ListItem;
