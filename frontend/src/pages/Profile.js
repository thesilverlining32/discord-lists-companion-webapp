import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';

const Profile = () => {
  const { user, updateUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Here you would make an API call to update the user's profile
    // For now, we'll just update the local state
    await updateUser(editedUser);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile">
      <h1>User Profile</h1>
      {isEditing ? (
        <div className="edit-profile">
          <input
            type="text"
            name="username"
            value={editedUser.username}
            onChange={handleChange}
          />
          <input
            type="email"
            name="email"
            value={editedUser.email}
            onChange={handleChange}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="profile-info">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Discord ID:</strong> {user.discord_id}</p>
          <p><strong>Status:</strong> {user.is_approved ? 'Approved' : 'Pending Approval'}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
