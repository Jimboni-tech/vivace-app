import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../constants/theme';

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
    backgroundColor: COLORS.background,
    padding: SIZES.spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 70,
    color: COLORS.text,
    marginBottom: 0,
    ...FONTS.black,
  },
  subtitle: {
    fontSize: SIZES.large,
    color: COLORS.textLight,
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
    fontSize: SIZES.large,
    color: '#7BA8D9',
    textAlign: 'center',
    lineHeight: 24,
    ...FONTS.black,
  },
  actions: {
    paddingBottom: 40,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    textAlign: 'center',
    ...FONTS.bold,
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.large,
    textAlign: 'center',
    ...FONTS.bold,
  },
});