import * as React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode

import AuthStackNavigator from './navigation/AuthStackNavigator';
// Change this import to your new MainTabsNavigator
import BottomBar from './components/BottomBar.jsx'; // <--- CHANGE THIS LINE

export default function App() {
  const [userToken, setUserToken] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000; // Current time in seconds
            if (decoded.exp && decoded.exp > currentTime) {
              setUserToken(token);
            } else {
              console.log('Token expired, clearing storage');
              await AsyncStorage.removeItem('userToken');
              setUserToken(null);
            }
          } catch (e) {
            console.error('Failed to decode token:', e);
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
          }
        } else {
          setUserToken(null);
        }
      } catch (e) {
        console.error('Failed to load stored token:', e.message);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredToken();
  }, []);

  const handleLoginSuccess = async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
    } catch (e) {
      console.error('Failed to store token:', e.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    } catch (e) {
      console.error('Failed to remove token during logout:', e.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading application...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken == null ? (
        <AuthStackNavigator onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Render the new MainTabsNavigator when authenticated
        <BottomBar onLogout={handleLogout} /> // <--- CHANGE THIS LINE
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
