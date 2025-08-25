import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎵</Text>
        <Text style={styles.title}>Vivace</Text>
        <Text style={styles.subtitle}>Your Musical Practice Companion</Text>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <Ionicons name="musical-notes" size={32} color="#3D9CFF" />
          <Text style={styles.featureTitle}>Practice Tools</Text>
          <Text style={styles.featureText}>Metronome, tuner, recorder, and notes all in one place</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
          <Text style={styles.featureTitle}>Gamification</Text>
          <Text style={styles.featureText}>Earn XP, level up, and maintain streaks</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="people" size={32} color="#8B5CF6" />
          <Text style={styles.featureTitle}>Social Features</Text>
          <Text style={styles.featureText}>Connect with fellow musicians and share progress</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('EmailRegister')}
        >
          <Text style={styles.registerButtonText}>Create Account</Text>
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
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#A1A1A1',
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
  },
  feature: {
    alignItems: 'center',
    marginBottom: 30,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginTop: 15,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
    color: '#A1A1A1',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3D9CFF',
  },
  registerButtonText: {
    color: '#3D9CFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});