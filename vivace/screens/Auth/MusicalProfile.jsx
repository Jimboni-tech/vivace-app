import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  KeyboardAvoidingView, ScrollView, SafeAreaView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../constants/api';

const INSTRUMENTS = [
  'Piano', 'Guitar', 'Violin', 'Cello', 'Flute', 'Clarinet', 
  'Saxophone', 'Trumpet', 'Drums', 'Bass', 'Voice', 'Other'
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Proficient player' },
  { value: 'expert', label: 'Expert', description: 'Master level' }
];

export default function MusicalProfileScreen({ navigation, route }) {
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedInstrument) {
      newErrors.instrument = 'Please select your primary instrument';
    }
    
    if (!selectedSkillLevel) {
      newErrors.skillLevel = 'Please select your skill level';
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

        // Updated endpoint to use /users for consistency with other routes
        const response = await fetch(`${BACKEND_URL}/users/profile-info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            primaryInstrument: selectedInstrument,
            skillLevel: selectedSkillLevel,
          }),
        });

        if (!response.ok) {
          let errorData = 'An unknown error occurred.';
          // More robust error handling: try to parse as JSON, otherwise read as text
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = await response.text();
          }
          Alert.alert('Error', errorData.message || errorData || 'Failed to update profile.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        navigation.navigate('PracticeGoals', {
          userData: {
            ...route.params?.userData,
            ...data.user
          },
        });
      } catch (error) {
        Alert.alert('Error', 'Failed to connect to server or update profile.');
        console.error(error);
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
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#1E1E1E" />
              </TouchableOpacity>
              <Text style={styles.title}>Musical Profile</Text>
              <Text style={styles.subtitle}>Tell us about your musical journey</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Primary Instrument</Text>
                <Text style={styles.sectionSubtitle}>What instrument do you play?</Text>
                
                <View style={styles.optionsGrid}>
                  {INSTRUMENTS.map((instrument) => (
                    <TouchableOpacity
                      key={instrument}
                      style={[
                        styles.optionCard,
                        selectedInstrument === instrument && styles.optionCardSelected
                      ]}
                      onPress={() => setSelectedInstrument(instrument)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedInstrument === instrument && styles.optionTextSelected
                      ]}>
                        {instrument}
                      </Text>
                      {selectedInstrument === instrument && (
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.instrument ? (
                  <Text style={styles.errorText}>{errors.instrument}</Text>
                ) : null}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skill Level</Text>
                <Text style={styles.sectionSubtitle}>How would you describe your current level?</Text>
                
                {SKILL_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.skillLevelCard,
                      selectedSkillLevel === level.value && styles.skillLevelCardSelected
                    ]}
                    onPress={() => setSelectedSkillLevel(level.value)}
                  >
                    <View style={styles.skillLevelContent}>
                      <Text style={[
                        styles.skillLevelLabel,
                        selectedSkillLevel === level.value && styles.skillLevelLabelSelected
                      ]}>
                        {level.label}
                      </Text>
                      <Text style={[
                        styles.skillLevelDescription,
                        selectedSkillLevel === level.value && styles.skillLevelDescriptionSelected
                      ]}>
                        {level.description}
                      </Text>
                    </View>
                    {selectedSkillLevel === level.value && (
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
                {errors.skillLevel ? (
                  <Text style={styles.errorText}>{errors.skillLevel}</Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>Next</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
    minHeight: 150,
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
    minHeight: 400,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 5,
    fontFamily: 'Nunito-Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7BA8D9',
    marginBottom: 20,
    fontFamily: 'Nunito-Regular',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  optionCardSelected: {
    backgroundColor: '#3D9CFF',
    borderColor: '#3D9CFF',
  },
  optionText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontWeight: '500',
    fontFamily: 'Nunito-Regular',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
  skillLevelCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skillLevelCardSelected: {
    backgroundColor: '#3D9CFF',
    borderColor: '#3D9CFF',
  },
  skillLevelContent: {
    flex: 1,
  },
  skillLevelLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 5,
    fontFamily: 'Nunito-Bold',
  },
  skillLevelLabelSelected: {
    color: '#FFFFFF',
  },
  skillLevelDescription: {
    fontSize: 14,
    color: '#7BA8D9',
    fontFamily: 'Nunito-Regular',
  },
  skillLevelDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Nunito-Regular',
  },
  nextButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D9CFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: 'Nunito-Bold',
  },
});
