import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useSession } from '../context/SessionContext';
import PracticeSessionBar from '../components/PracticeSessionBar';
import NotesModal from '../components/NotesModal';
import TunerScreen from './Tuner';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StartSessionScreen({ navigation }) {
  const {
    isSessionActive,
    isPaused,
    sessionTime,
    endSession,
    pauseSession,
    resumeSession,
    resetSession,
    sessionNotes,
    updateSessionNotes
  } = useSession();

  const [view, setView] = useState('session'); // 'session', 'tuner', 'metronome', 'recording'
  const [notesVisible, setNotesVisible] = useState(false);

  useEffect(() => {
    if (!isSessionActive) {
      navigation.navigate('Home');
    }
  }, [isSessionActive, navigation]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopSession = () => {
    // Instead of ending the session completely, just pause it
    pauseSession();
    
    // Navigate to the review screen
    navigation.navigate('SessionReview', { 
      fromPractice: true,  // Flag to indicate we're coming from practice
      notes: sessionNotes  // Pass the notes from the current session
    });
  };

  const handleCancelSession = () => {
    Alert.alert(
      'Cancel Session',
      'Are you sure you want to cancel this session? Your progress will not be saved.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes', style: 'destructive', onPress: () => {
            resetSession();
            navigation.navigate('Home');
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

  const handleNotesOpen = () => {
    setNotesVisible(true);
  };

  const handleNotesClose = () => {
    setNotesVisible(false);
  };

  const handleNotesSave = (note) => {
    updateSessionNotes(note);
    
    // API call to update the practice session in the backend
    const updateNoteInBackend = async (noteText) => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL;
        const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
        
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        const activeSessionId = await AsyncStorage.getItem('activeSessionId');
        if (!activeSessionId) {
          console.log('No active session ID found. Notes will be saved when the session ends.');
          return;
        }
        
        const response = await fetch(`${API_URL}/practice/${activeSessionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ notes: noteText })
        });
        
        if (response.ok) {
          console.log('Notes updated successfully in the backend');
        } else {
          console.error('Failed to update notes:', await response.text());
        }
      } catch (error) {
        console.error('Error updating notes:', error);
      }
    };
    
    // Try to update notes in the backend, but don't wait for it to complete
    updateNoteInBackend(note);
    
    setNotesVisible(false);
  };

  if (!isSessionActive) {
    return null;
  }

  const renderContent = () => {
    if (view === 'tuner') {
      return <TunerScreen />;
    }
    if (view === 'metronome') {
      return (
        <View style={styles.toolContentInner}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Metronome</Text>
          <Text style={{ color: '#fff', fontSize: 18 }}>Static metronome UI goes here</Text>
        </View>
      );
    }
    if (view === 'recording') {
      return (
        <View style={styles.toolContentInner}>
          <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Recording</Text>
          <Text style={{ color: '#fff', fontSize: 18 }}>Static recording UI goes here</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.leftButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSession}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          {/* Place for back button that doesn't affect layout */}
          <View style={styles.backButtonPlaceholder}>
            {view !== 'session' && (
              <TouchableOpacity style={styles.backButton} onPress={() => setView('session')}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.stopButtonTop} onPress={handleStopSession}>
          <Text style={styles.stopButtonTextTop}>Done</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mainContent}>
        {/* Absolute positioned timer that will never move */}
        <View style={styles.fixedTimerContainer}>
          <View style={styles.timerCard}>
            <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
          </View>
        </View>
        
        {/* Tool content in a separate container that doesn't affect timer position */}
        {view !== 'session' && (
          <View style={styles.toolContentWrapper}>
            {renderContent()}
          </View>
        )}
      </View>
      <PracticeSessionBar
        paused={isPaused}
        onPauseToggle={handlePauseToggle}
        onTunerPress={() => setView('tuner')}
        onMetronomePress={() => setView('metronome')}
        onRecordingPress={() => setView('recording')}
        onNotesPress={handleNotesOpen}
      />

      {/* Notes Modal */}
      <NotesModal
        visible={notesVisible}
        onClose={handleNotesClose}
        onSave={handleNotesSave}
        initialNote={sessionNotes}
      />
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 10,
    height: 80, // Fixed height for topBar
  },
  leftButtons: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: 80, // Match topBar height
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
  backButtonPlaceholder: {
    height: 40, // Fixed height for placeholder
    width: '100%',
    marginTop: 5,
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
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  fixedTimerContainer: {
    position: 'absolute',
    top: 30, // Fixed distance from top
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
    height: 120, // Fixed height
  },
  toolContentWrapper: {
    position: 'absolute',
    top: 180, // Positioned below the timer with adequate spacing
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  toolContentInner: {
    alignItems: 'center',
  },
  timerCard: {
    padding: 30,
    alignItems: 'center',
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
});