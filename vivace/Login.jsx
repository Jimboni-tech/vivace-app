import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3001';

export default function LoginPage({ navigation, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        await AsyncStorage.setItem('userToken', data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.token);
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
  setError('');
  setMessage('');
  if (!username || !password) {
    setError('Username and password are required.');
    setLoading(false);
    return;
  }
  setLoading(true);
  try {
    const url = `${API_BASE_URL}/api/register`; // Fixed endpoint
    const body = JSON.stringify({ username, password });
    console.log('Register URL:', url);
    console.log('Request body:', body);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const rawText = await response.text();
      console.log('Non-JSON response:', rawText);
      setError(`Server error (Status: ${response.status}): ${response.status === 404 ? 'Endpoint not found' : 'Invalid response'}`);
      return;
    }
    const data = await response.json();
    console.log('Response:', response.status, data);
    if (response.ok) {
      setMessage(data.message + '. You can now log in.');
    } else {
      setError(data.message || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('Registration error:', err.message);
    setError('Network error or server is unreachable: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      {typeof error === 'string' && error ? <Text style={styles.errorText}>{error}</Text> : null}
      {typeof message === 'string' && message ? <Text style={styles.messageText}>{message}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#007bff',
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
  messageText: {
    color: 'green',
    marginBottom: 15,
    fontSize: 14,
    textAlign: 'center',
  },
});