// src/pages/Profile.js
import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import './Profile.css';

const Profile = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Here you would implement the API call to update the user's profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>User Profile</h1>
          {!isEditing && (
            <button onClick={handleEdit} className="edit-button">
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="profile-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={editedUser.username}
                onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                disabled
              />
              <span className="field-note">Username cannot be changed</span>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={editedUser.email}
                onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                disabled
              />
              <span className="field-note">Email is managed through Discord</span>
            </div>

            <div className="button-group">
              <button onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleSave} className="save-button">
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-info">
            <div className="info-group">
              <div className="avatar-section">
                {user.avatar ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.avatar}.png`}
                    alt="Profile"
                    className="profile-avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="info-section">
                <div className="info-item">
                  <label>Username</label>
                  <p>{user.username}</p>
                </div>

                <div className="info-item">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>

                <div className="info-item">
                  <label>Discord ID</label>
                  <p>{user.discord_id}</p>
                </div>

                <div className="info-item">
                  <label>Status</label>
                  <p className={`status ${user.is_approved ? 'approved' : 'pending'}`}>
                    {user.is_approved ? 'Approved' : 'Pending Approval'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
