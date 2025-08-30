import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL

export default function EmailRegisterScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    console.log('Attempting registration to:', BACKEND_URL);
    console.log('Registration data:', { email, password: '***' });

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        
        // Navigate to profile setup instead of main app
        navigation.navigate('ProfileSetup', {
          userData: {
            email,
            token: data.token
          }
        });
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration network error:', err.message);
      if (err.message.includes('Network request failed')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError('Network error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
              </TouchableOpacity>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join the musical community</Text>
            </View>

            <View style={styles.form}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#7BA8D9" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#A1A1A1"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#7BA8D9" />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#A1A1A1"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#7BA8D9" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#A1A1A1"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
    minHeight: 180,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'Nunito-Black',
  },
  subtitle: {
    fontSize: 16,
    color: '#7BA8D9',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Nunito-Regular',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 350,
  },
  errorContainer: {
    backgroundColor: '#FF4444',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
    color: '#1E1E1E',
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  registerButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#3D9CFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#A1A1A1',
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  termsText: {
    color: '#A1A1A1',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    fontFamily: 'Nunito-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  footerText: {
    color: '#A1A1A1',
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  signInLink: {
    color: '#3D9CFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
});