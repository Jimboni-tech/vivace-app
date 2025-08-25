import * as React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import AuthStackNavigator from './navigation/AuthStackNavigator';
import BottomBar from './components/BottomBar';
import { SessionProvider } from './context/SessionContext';

export default function App() {
  const [userToken, setUserToken] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token && token.trim() !== '') {
          try {
            // Check if token has the correct format (3 parts separated by dots)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
              console.log('Invalid token format, clearing storage');
              await AsyncStorage.removeItem('userToken');
              setUserToken(null);
              return;
            }

            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
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
      if (token && token.trim() !== '') {
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
      }
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
        <ActivityIndicator size="large" color="#3D9CFF" />
        <Text style={styles.loadingText}>Loading Vivace...</Text>
      </View>
    );
  }

  return (
    <SessionProvider>
      <NavigationContainer>
        {userToken == null ? (
          <AuthStackNavigator onLoginSuccess={handleLoginSuccess} />
        ) : (
          <BottomBar onLogout={handleLogout} />
        )}
        <StatusBar style="light" />
      </NavigationContainer>
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#EAEAEA',
    fontSize: 18,
    marginTop: 20,
  },
});
