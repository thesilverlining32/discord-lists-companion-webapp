import React from 'react';
import ListItem from './ListItem';

function List({ list }) {
    return (
        <div>
            <h2>{list.name}</h2>
            <ul>
                {list.items.map(item => (
                    <ListItem key={item._id} item={item} />
                ))}
            </ul>
        </div>
    );
}

export default List;
