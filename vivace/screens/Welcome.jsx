import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const features = [
    {
      text: "Log practice sessions, notes, and recordings"
    },
    {
      text: "Earn XP, climb levels, and keep streaks alive"
    },
    {
      text: "Customize your experience with unique themes"
    },
    {
      text: "Add friends, share progress, and climb leaderboards"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out and slide right animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100, // Slide to the right
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Update to next feature
        setCurrentFeatureIndex((prevIndex) => 
          prevIndex === features.length - 1 ? 0 : prevIndex + 1
        );
        
        // Reset slide position to left and fade in
        slideAnim.setValue(-100); // Start from the left
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0, // Slide to center
            duration: 400,
            useNativeDriver: true,
          })
        ]).start();
      });
    }, 3000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vivace</Text>
      </View>

      <View style={styles.features}>
        <Animated.View 
          style={[
            styles.feature,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          <Text style={styles.featureText}>
            {features[currentFeatureIndex].text}
          </Text>
        </Animated.View>
        
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
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 70,
    color: '#1E1E1E',
    marginBottom: 0,
    fontFamily: 'Nunito-Black',
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 18,
    color: '#A1A1A1',
    textAlign: 'center',
  },
  features: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feature: {
    alignItems: 'center',
    marginBottom: 30,
    minHeight: 100, 
  },
  featureText: {
    fontSize: 20,
    color: '#7BA8D9',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Nunito-Black',
    fontWeight: 'bold',
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