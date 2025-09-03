import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform,
  KeyboardAvoidingView, ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { DEFAULT_THEME, SIZES, FONTS } from '../../constants/theme';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL;

export default function ProfileSetupScreen({ navigation, route }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.trim().length < 3) {
      newErrors.displayName = 'Display name must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          Alert.alert('Error', 'User token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/auth/profile-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            displayName: displayName.trim(),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save profile');
        }

        const userData = await response.json();
        navigation.navigate('MusicalProfile', {
          userData: userData,
        });
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
      } finally {
        setLoading(false);
      }
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
                <Ionicons name="arrow-back" size={24} color={DEFAULT_THEME.common.text} />
              </TouchableOpacity>
              <Text style={styles.title}>Tell Us About Yourself</Text>
              <Text style={styles.subtitle}>Let's personalize your experience</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={DEFAULT_THEME.button.primaryBackground} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor={DEFAULT_THEME.input.placeholder}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              {errors.firstName ? (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              ) : null}

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={DEFAULT_THEME.button.primaryBackground} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor={DEFAULT_THEME.input.placeholder}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </View>
              {errors.lastName ? (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              ) : null}

              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color={DEFAULT_THEME.button.primaryBackground} />
                <TextInput
                  style={styles.input}
                  placeholder="Display Name"
                  placeholderTextColor={DEFAULT_THEME.input.placeholder}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={handleNext}
                />
              </View>
              {errors.displayName ? (
                <Text style={styles.errorText}>{errors.displayName}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={DEFAULT_THEME.button.primaryText} />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color={DEFAULT_THEME.button.primaryText} />
                  </>
                )}
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
    backgroundColor: DEFAULT_THEME.common.background,
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
    backgroundColor: DEFAULT_THEME.common.background,
    padding: SIZES.spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: SIZES.spacing.lg,
    minHeight: 200,
  },
  backButton: {
    position: 'absolute',
    top: SIZES.spacing.lg,
    left: 0,
    padding: SIZES.spacing.md,
    backgroundColor: DEFAULT_THEME.input.background,
    borderRadius: SIZES.radius.round / 2,
  },
  title: {
    ...FONTS.h1,
    color: DEFAULT_THEME.common.text,
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body1,
    color: DEFAULT_THEME.button.primaryBackground,
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 300,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DEFAULT_THEME.input.background,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: DEFAULT_THEME.input.border,
    shadowColor: DEFAULT_THEME.common.shadow,
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
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.md,
    color: DEFAULT_THEME.input.text,
    fontSize: SIZES.medium,
    ...FONTS.regular,
  },
  errorText: {
    color: DEFAULT_THEME.status.error.text,
    fontSize: SIZES.small,
    marginBottom: SIZES.spacing.md,
    marginLeft: SIZES.spacing.md,
    ...FONTS.regular,
  },
  nextButton: {
    backgroundColor: DEFAULT_THEME.button.primaryBackground,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DEFAULT_THEME.button.primaryBackground,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  nextButtonText: {
    color: DEFAULT_THEME.button.primaryText,
    fontSize: SIZES.large,
    marginRight: SIZES.spacing.sm,
    ...FONTS.button,
  },
});
