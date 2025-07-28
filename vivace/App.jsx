import * as React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
// FIX: Change the import statement for jwt-decode
import { jwtDecode } from 'jwt-decode'; // <--- CHANGE THIS LINE
import AuthStackNavigator from './navigation/AuthStackNavigator';
import AppStackNavigator from './navigation/AppStackNavigator';

export default function App() {
  const [userToken, setUserToken] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStoredToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          try {
            // Now jwtDecode directly refers to the function
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
            // Log the actual error object for better debugging
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
        <AppStackNavigator onLogout={handleLogout} />
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
