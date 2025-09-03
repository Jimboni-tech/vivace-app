import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useSession } from '../context/SessionContext';
import PracticeSessionBar from '../components/PracticeSessionBar';
import NotesModal from '../components/NotesModal';
import AddPieceModal from '../components/AddPieceModal';
import PiecesList from '../components/PiecesList';
import TunerScreen from './Tuner';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionApi } from '../utils/apiClient';
import { DEFAULT_THEME, FONTS, SIZES, BASE_COLORS } from '../constants/theme';

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
  const [addPieceVisible, setAddPieceVisible] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isSessionActive) {
      navigation.navigate('Home');
    }
  }, [isSessionActive, navigation]);

  // Fetch session data when the component mounts
  useEffect(() => {
    const getSessionId = async () => {
      try {
        const id = await AsyncStorage.getItem('activeSessionId');
        if (id) {
          setSessionId(id);
          fetchSessionData(id);
        }
      } catch (error) {
        console.error('Error getting session ID:', error);
      }
    };

    getSessionId();
  }, []);

  // Fetch the session data from the backend
  const fetchSessionData = async (id) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await sessionApi.getSession(id);
      setSessionData(data);
    } catch (error) {
      console.error('Error fetching session data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh session data
  const refreshSessionData = async () => {
    if (!sessionId) return;
    
    try {
      setRefreshing(true);
      await fetchSessionData(sessionId);
    } finally {
      setRefreshing(false);
    }
  };

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

  const handleAddPieceOpen = () => {
    setAddPieceVisible(true);
  };

  const handleAddPieceClose = () => {
    setAddPieceVisible(false);
  };

  const handlePieceAdded = (updatedSession) => {
    setSessionData(updatedSession);
  };

  const handlePiecePress = (piece, index) => {
    // For now, just show some details. In the future, this could open an edit modal
    Alert.alert(
      piece.title,
      `Type: ${piece.type}\n${piece.notes ? `Notes: ${piece.notes}` : ''}`
    );
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
          <Text style={{ color: BASE_COLORS.white, fontSize: SIZES.xxlarge, ...FONTS.bold, marginBottom: SIZES.spacing.lg }}>Metronome</Text>
          <Text style={{ color: BASE_COLORS.white, fontSize: SIZES.large }}>Static metronome UI goes here</Text>
        </View>
      );
    }
    if (view === 'recording') {
      return (
        <View style={styles.toolContentInner}>
          <Text style={{ color: BASE_COLORS.white, fontSize: SIZES.xxlarge, ...FONTS.bold, marginBottom: SIZES.spacing.lg }}>Recording</Text>
          <Text style={{ color: BASE_COLORS.white, fontSize: SIZES.large }}>Static recording UI goes here</Text>
        </View>
      );
    }
    // Default view - session
    
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
                <Ionicons name="arrow-back" size={24} color={BASE_COLORS.white} />
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
        {view !== 'session' ? (
          <View style={styles.toolContentWrapper}>
            {renderContent()}
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            {renderContent()}
          </ScrollView>
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
      
  {/* Add Piece Modal removed from practice session screen */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BASE_COLORS.blue.primary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.lg,
    zIndex: 10,
    height: 80, // Fixed height for topBar
  },
  leftButtons: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: 80, // Match topBar height
  },
  cancelButton: {
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: BASE_COLORS.white,
    fontSize: SIZES.large,
    ...FONTS.bold,
  },
  backButtonPlaceholder: {
    height: 40, // Fixed height for placeholder
    width: '100%',
    marginTop: SIZES.spacing.xs,
  },
  stopButtonTop: {
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stopButtonTextTop: {
    color: BASE_COLORS.white,
    fontSize: SIZES.large,
    ...FONTS.bold,
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
    paddingHorizontal: SIZES.spacing.lg,
    zIndex: 1,
  },
  toolContentInner: {
    alignItems: 'center',
  },
  timerCard: {
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    elevation: 8,
  },
  timerLabel: {
    fontSize: SIZES.large,
    color: BASE_COLORS.white,
    marginBottom: SIZES.spacing.sm,
    ...FONTS.regular,
  },
  timerValue: {
    fontSize: 52,
    color: BASE_COLORS.white,
    ...FONTS.bold,
  },
  backButton: {
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.sm - 1,
    borderRadius: SIZES.radius.round,
    backgroundColor: DEFAULT_THEME.transparent,
  },
  scrollView: {
    flex: 1,
    marginTop: 150, // Ensure it's below the timer
    paddingHorizontal: SIZES.spacing.lg,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding at the bottom to prevent content from being hidden behind the bottom bar
  },
  sessionContent: {
    flex: 1,
    width: '100%',
  },
  addPieceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.md,
    marginVertical: SIZES.spacing.lg,
  },
  addPieceButtonText: {
    color: BASE_COLORS.white,
    fontSize: SIZES.large,
    ...FONTS.bold,
    marginLeft: SIZES.spacing.sm,
  },
  piecesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    color: BASE_COLORS.white,
    ...FONTS.bold,
    marginBottom: SIZES.spacing.md,
  },
});