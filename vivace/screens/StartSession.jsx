import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSession } from '../context/SessionContext';
import SessionNavBar from '../components/SessionNavBar';

export default function StartSessionScreen({ navigation }) {
  const { 
    isSessionActive, 
    sessionTime, 
    startSession,
    endSession
  } = useSession();

  // Auto-start session when component mounts
  useEffect(() => {
    if (!isSessionActive) {
      startSession();
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopSession = () => {
    endSession();
  };

  // Show session screen when session is active
  if (isSessionActive) {
    return (
      <View style={styles.container}>
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>Practice Session</Text>
          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>{formatTime(sessionTime)}</Text>
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Stop Button in Center */}
          <TouchableOpacity style={styles.stopButton} onPress={handleStopSession}>
            <Text style={styles.stopButtonText}>Stop Session</Text>
          </TouchableOpacity>
        </View>

        {/* Session Navigation Bar - Positioned at bottom */}
        <SessionNavBar />
      </View>
    );
  }

  // Show start session screen when not active
  return (
    <View style={styles.container}>
      <View style={styles.startSessionContent}>
        <Text style={styles.startSessionTitle}>Ready to Practice?</Text>
        <Text style={styles.startSessionSubtitle}>Tap the button below to start your session</Text>
        <TouchableOpacity style={styles.startButton} onPress={startSession}>
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  startSessionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  startSessionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 15,
    textAlign: 'center',
  },
  startSessionSubtitle: {
    fontSize: 16,
    color: '#A1A1A1',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionHeader: {
    backgroundColor: '#1E1E1E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAEAEA',
    textAlign: 'center',
    marginBottom: 15,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#A1A1A1',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D9CFF',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100, // Add padding to prevent overlap with bottom nav
  },
  stopButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
