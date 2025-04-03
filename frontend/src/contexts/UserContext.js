// src/contexts/UserContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser } from '../services/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();

        // Log the user data for debugging
        console.log('Loaded user data:', userData);

        // Ensure the _id field is mapped to id consistently
        if (userData) {
          // If the user data has _id but not id, add id property
          if (userData._id && !userData.id) {
            userData.id = userData._id;
          }

          // Ensure the ID is a string for consistent comparisons
          if (userData.id) {
            userData.id = String(userData.id);
          }

          console.log('Processed user data:', userData);
        }

        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
