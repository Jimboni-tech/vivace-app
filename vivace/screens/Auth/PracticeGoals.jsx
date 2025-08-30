import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  KeyboardAvoidingView, ScrollView, SafeAreaView, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../../constants/api';

const GOALS = [
  'Learn to read sheet music',
  'Improve technique',
  'Master specific pieces',
  'Build a repertoire',
  'Prepare for performances',
  'Join a band or ensemble',
  'Record music',
  'Compose original music',
  'Improve rhythm and timing',
  'Learn music theory',
  'Develop ear training',
  'Build confidence'
];

const PRACTICE_GOALS = [
  { minutes: 15, label: '15 minutes', description: 'Quick daily practice' },
  { minutes: 30, label: '30 minutes', description: 'Standard daily practice' },
  { minutes: 45, label: '45 minutes', description: 'Extended practice' },
  { minutes: 60, label: '1 hour', description: 'Intensive practice' },
  { minutes: 90, label: '1.5 hours', description: 'Serious practice' },
  { minutes: 120, label: '2+ hours', description: 'Professional practice' }
];

const WEEKLY_SESSIONS = [
  { sessions: 3, label: '3 times', description: 'Light practice' },
  { sessions: 5, label: '5 times', description: 'Regular practice' },
  { sessions: 7, label: '7 times', description: 'Daily practice' },
  { sessions: 10, label: '10+ times', description: 'Intensive practice' }
];

export default function PracticeGoalsScreen({ navigation, route, onLoginSuccess }) {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedDailyMinutes, setSelectedDailyMinutes] = useState(30);
  const [selectedWeeklySessions, setSelectedWeeklySessions] = useState(5);
  const [customGoals, setCustomGoals] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (selectedGoals.length === 0 && !customGoals.trim()) {
      newErrors.goals = 'Please select at least one goal or add a custom goal';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          Alert.alert('Error', 'User token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/users/practice-goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            goals: selectedGoals,
            customGoals: customGoals.trim(),
            practiceGoals: {
              dailyMinutes: selectedDailyMinutes,
              weeklySessions: selectedWeeklySessions
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          Alert.alert('Error', errorData.message || 'Failed to save practice goals.');
          setLoading(false);
          return;
        }

        const data = await response.json();
        Alert.alert('Success', 'Practice goals saved successfully!');
        console.log('Practice goals saved:', data);
        
        // Signal to the top-level App component that login/setup is complete
        onLoginSuccess(userToken);
      } catch (error) {
        Alert.alert('Error', `Failed to save practice goals: ${error.message}`);
        console.error('Error saving practice goals:', error);
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
              <Text style={styles.title}>Practice Goals</Text>
              <Text style={styles.subtitle}>Set your musical objectives</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What do you want to achieve?</Text>
                <Text style={styles.sectionSubtitle}>Select your musical goals (you can choose multiple)</Text>
                
                <View style={styles.goalsGrid}>
                  {GOALS.map((goal) => (
                    <TouchableOpacity
                      key={goal}
                      style={[
                        styles.goalCard,
                        selectedGoals.includes(goal) && styles.goalCardSelected
                      ]}
                      onPress={() => toggleGoal(goal)}
                    >
                      <Text style={[
                        styles.goalText,
                        selectedGoals.includes(goal) && styles.goalTextSelected
                      ]}>
                        {goal}
                      </Text>
                      {selectedGoals.includes(goal) && (
                        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.customGoalContainer}>
                  <Text style={styles.customGoalLabel}>Or add your own goal:</Text>
                  <TextInput
                    style={styles.customGoalInput}
                    placeholder="Enter your custom goal..."
                    placeholderTextColor="#A1A1A1"
                    value={customGoals}
                    onChangeText={setCustomGoals}
                    multiline
                    numberOfLines={2}
                  />
                </View>
                {errors.goals ? (
                  <Text style={styles.errorText}>{errors.goals}</Text>
                ) : null}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Practice Time</Text>
                <Text style={styles.sectionSubtitle}>How long do you want to practice each day?</Text>
                
                <View style={styles.optionsGrid}>
                  {PRACTICE_GOALS.map((goal) => (
                    <TouchableOpacity
                      key={goal.minutes}
                      style={[
                        styles.optionCard,
                        selectedDailyMinutes === goal.minutes && styles.optionCardSelected
                      ]}
                      onPress={() => setSelectedDailyMinutes(goal.minutes)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedDailyMinutes === goal.minutes && styles.optionTextSelected
                      ]}>
                        {goal.label}
                      </Text>
                      <Text style={[
                        styles.optionDescription,
                        selectedDailyMinutes === goal.minutes && styles.optionDescriptionSelected
                      ]}>
                        {goal.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Practice Frequency</Text>
                <Text style={styles.sectionSubtitle}>How many times per week?</Text>
                
                <View style={styles.optionsGrid}>
                  {WEEKLY_SESSIONS.map((session) => (
                    <TouchableOpacity
                      key={session.sessions}
                      style={[
                        styles.optionCard,
                        selectedWeeklySessions === session.sessions && styles.optionCardSelected
                      ]}
                      onPress={() => setSelectedWeeklySessions(session.sessions)}
                    >
                      <Text style={[
                        styles.optionText,
                        selectedWeeklySessions === session.sessions && styles.optionTextSelected
                      ]}>
                        {session.label}
                      </Text>
                      <Text style={[
                        styles.optionDescription,
                        selectedWeeklySessions === session.sessions && styles.optionDescriptionSelected
                      ]}>
                        {session.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.completeButtonText}>Complete Setup</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
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
    minHeight: 120,
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
    minHeight: 500,
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
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
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
  goalCardSelected: {
    backgroundColor: '#3D9CFF',
    borderColor: '#3D9CFF',
  },
  goalText: {
    fontSize: 12,
    color: '#1E1E1E',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
  },
  goalTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
  customGoalContainer: {
    marginTop: 20,
  },
  customGoalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 10,
    fontFamily: 'Nunito-Bold',
  },
  customGoalInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1E1E1E',
    fontFamily: 'Nunito-Regular',
    textAlignVertical: 'top',
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
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#7BA8D9',
    textAlign: 'center',
    fontFamily: 'Nunito-Regular',
  },
  optionDescriptionSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Nunito-Regular',
  },
  completeButton: {
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
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: 'Nunito-Bold',
  },
});
