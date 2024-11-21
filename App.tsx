import React, { createContext, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Context for providing the authenticated user's ID
export const AuthContext = createContext<string | null>(null);

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    signInAnonymously(auth)
      .then(() => {
        console.log('Signed in anonymously');
        console.log(auth.currentUser?.uid);
        setUserId(auth.currentUser?.uid || null);
      })
      .catch((error) => {
        console.error('Error signing in anonymously: ', error);
      });
  }, []);

  return (
    <AuthContext.Provider value={userId}>
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
