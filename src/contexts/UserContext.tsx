import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../models/types';
import { db } from '../db/LocalDB';

interface UserContextValue {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
}

const UserContext = createContext<UserContextValue>({
  currentUser: null,
  setCurrentUser: () => {},
  loading: true
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing user on app load
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        // Try to get stored user ID from localStorage
        const storedUserId = localStorage.getItem('currentUserId');
        
        if (storedUserId) {
          // If we have a stored ID, fetch the user from the database
          const user = await db.users.get(storedUserId);
          if (user) {
            setCurrentUser(user);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);
  
  // When current user changes, update localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', currentUser.id);
    } else {
      localStorage.removeItem('currentUserId');
    }
  }, [currentUser]);
  
  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
} 