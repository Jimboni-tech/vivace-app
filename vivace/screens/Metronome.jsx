import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useSession } from '../context/SessionContext';
import PracticeSessionBar from '../components/PracticeSessionBar';
import { Ionicons } from '@expo/vector-icons';

export default function MetronomeScreen({ navigation }) {
  const { 
    isSessionActive, 
    isPaused, // Get the isPaused state from the context
    sessionTime, 
    startSession,
    endSession,
    pauseSession, // Get the pauseSession function
    resumeSession, // Get the resumeSession function
    resetSession // <-- import resetSession
  } = useSession();

  useEffect(() => {
    if (!isSessionActive) {
      navigation.navigate('HomeTab');
    }
  }, [isSessionActive, navigation]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopSession = () => {
    endSession();
    navigation.navigate('StartSessionTab'); // Go to the session tab, not just HomeTab
  };

  const handleCancelSession = () => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this session? Your progress will not be saved.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => {
            resetSession();
            navigation.navigate('HomeTab'); // Go to HomeTab only
          }
        }
      ]
    );
  };

  const handlePauseToggle = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  if (!isSessionActive) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSession}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.stopButtonTop} onPress={handleStopSession}>
          <Text style={styles.stopButtonTextTop}>Stop</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sessionContent}>
        <View style={styles.timerCard}>
          <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
        </View>
        <View style={styles.featureContainer}>
          <Text style={styles.featureText}>Metronome Feature</Text>
        </View>
      </View>
      <PracticeSessionBar paused={isPaused} onPauseToggle={handlePauseToggle} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3D9CFF',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
  stopButtonTop: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  stopButtonTextTop: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
  sessionContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    paddingTop: 60,
  },
  timerCard: {
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
    elevation: 8,
  },
  timerValue: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
  featureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
});
