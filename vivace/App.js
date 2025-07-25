import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native'; // Ensure TouchableOpacity is imported
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginPage from './Login.jsx';

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// AppStackNav now accepts onLogout as a prop
function AppStackNav({ onLogout }) {
  return (
    <AppStack.Navigator>
      {/* This is a placeholder for your main app content */}
      <AppStack.Screen name="Home" options={{ headerShown: false }}>
        {() => (
          <View style={styles.container}>
            <Text style={styles.title}>Welcome to the App!</Text>
            <Text style={styles.subtitle}>You are logged in.</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </AppStack.Screen>
    </AppStack.Navigator>
  );
}

// AuthStackNav now accepts onLoginSuccess as a prop
function AuthStackNav({ onLoginSuccess }) {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        // Pass onLoginSuccess from AuthStackNav's props to LoginPage
        children={(props) => <LoginPage {...props} onLoginSuccess={onLoginSuccess} />}
        options={{ headerShown: false }}
      />
    </AuthStack.Navigator>
  );
}

// Ensure 'App' is exported as default. This is crucial for index.js.
export default function App() {
  const [userToken, setUserToken] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadStoredToken = async () => {
      let token = null;
      try {
        token = await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.error('Failed to load stored token:', e);
      } finally {
        setUserToken(token);
        setIsLoading(false);
      }
    };
    loadStoredToken();
  }, []);

  const handleLoginSuccess = async (token) => {
    setUserToken(token);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    } catch (e) {
      console.error('Failed to remove token during logout:', e);
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

  // Removed unused 'Stack' declaration
  return (
    <NavigationContainer>
      {userToken == null ? (
        // Pass handleLoginSuccess to AuthStackNav
        <AuthStackNav onLoginSuccess={handleLoginSuccess} />
      ) : (
        // Pass handleLogout to AppStackNav
        <AppStackNav onLogout={handleLogout} />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
