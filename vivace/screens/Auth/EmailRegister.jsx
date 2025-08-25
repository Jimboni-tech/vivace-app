import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmailRegisterScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    // Mock registration - in real app, this would call your backend
    Alert.alert('Success', 'Account created successfully!', [
      {
        text: 'OK',
        onPress: () => {
          const mockToken = 'mock-jwt-token-' + Date.now();
          onLoginSuccess(mockToken);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#EAEAEA" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the musical community</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#A1A1A1" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A1A1A1"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#A1A1A1" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A1A1A1"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#A1A1A1" />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#A1A1A1"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 0,
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#A1A1A1',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: '#EAEAEA',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  termsText: {
    color: '#A1A1A1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#A1A1A1',
    fontSize: 16,
  },
  signInLink: {
    color: '#3D9CFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});