import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const BACKGROUND_COLOR = '#E0F7FA';
const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;
const GOOGLE_IOS_CLIENT_ID = '570016593022-5at03rqehieormc3ipm9vkadb4nnd08j.apps.googleusercontent.com';
const GOOGLE_WEB_CLIENT_ID = '570016593022-j1vfe09bk9v003e9pmsocts0l0bi0obm.apps.googleusercontent.com';

export default function WelcomeScreen({ navigation, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: 'vivace://auth/google/callback',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        handleGoogleSignIn(authentication.idToken);
      } else {
        Alert.alert('Google Sign-In Failed', 'No ID token received.');
        setLoading(false);
      }
    } else if (response?.type === 'cancel') {
      Alert.alert('Sign-In Cancelled', 'Google sign-in was cancelled.');
      setLoading(false);
    } else if (response?.type === 'error') {
      Alert.alert('Sign-In Error', `Google sign-in failed: ${response.error?.message || 'Unknown error'}`);
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('userToken', data.token);
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess(data.token);
        } else {
          console.warn('onLoginSuccess is not a function, navigating manually');
          navigation.navigate('Home');
        }
        Alert.alert('Success', 'Google Sign-In successful!');
      } else {
        Alert.alert('Error', data.message || 'Google Sign-In failed on backend.');
      }
    } catch (error) {
      console.error('Google Sign-In Network Error:', error.message);
      if (error.message.includes('Network request failed')) {
        Alert.alert('Error', 'Unable to connect to the server. Please check your internet connection.');
      } else {
        Alert.alert('Error', 'Network error during Google Sign-In.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithEmail = () => {
    navigation.navigate('EmailRegister');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND_COLOR} />

      <View style={styles.topSection}>
        <Image
          source={{ uri: 'https://placehold.co/180x180/000000/FFFFFF?text=VIVACE' }}
          style={styles.logo}
          accessibilityLabel="Vivace App Logo"
        />
        <Text style={styles.appName}>Vivace</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={() => {
            setLoading(true);
            promptAsync();
          }}
          activeOpacity={0.7}
          disabled={!request || loading}
        >
          <Image
            source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.emailButton]}
          onPress={handleSignUpWithEmail}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Image
            source={{ uri: 'https://img.icons8.com/ios-filled/50/FFFFFF/mail.png' }}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Sign up with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.activityIndicator} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: (width * 0.45) / 2,
    marginBottom: 25,
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  appName: {
    fontSize: width * 0.13,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomSection: {
    width: '88%',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 35,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  emailButton: {
    backgroundColor: '#6C757D',
  },
  buttonIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    tintColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  loginButton: {
    marginTop: 25,
    paddingVertical: 10,
  },
  loginButtonText: {
    fontSize: 17,
    color: '#333333',
  },
  loginLink: {
    fontWeight: 'bold',
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  activityIndicator: {
    marginTop: 20,
  },
});