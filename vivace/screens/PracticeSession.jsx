import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSession } from '../context/SessionContext';
import { Ionicons } from '@expo/vector-icons';
import PracticeSessionBar from '../components/PracticeSessionBar';

export default function StartSessionScreen({ navigation }) {
  const { 
    isSessionActive, 
    sessionTime, 
    startSession,
    endSession
  } = useSession();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopSession = () => {
    endSession();
    navigation.navigate('HomeTab'); // Navigate back to home
  };

  if (!isSessionActive) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Start Session</Text>
        </View>
        <View style={styles.startSessionContent}>
          <Text style={styles.startSessionTitle}>Ready to Practice?</Text>
          <Text style={styles.startSessionSubtitle}>
            Tap the button below to start your session
          </Text>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startSession}
          >
            <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sessionContent}>
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Session Time</Text>
          <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.stopButton} 
          onPress={handleStopSession}
        >
          <Ionicons name="stop-circle" size={32} color="#3D9CFF" />
          <Text style={styles.stopButtonText}>Stop Session</Text>
        </TouchableOpacity>
      </View>

      <PracticeSessionBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3D9CFF',
  },
  sessionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingTop: 60, // Added to compensate for removed header
  },
  timerCard: {
    backgroundColor: '#7BB9FF', // Lighter shade of blue
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  timerLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
    fontFamily: 'Nunito-Regular',
  },
  timerValue: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
  stopButton: {
    backgroundColor: '#7BB9FF', // Lighter shade of blue
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Nunito-Bold',
  }
});
