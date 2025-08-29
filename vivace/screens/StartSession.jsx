import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  StatusBar,
  ScrollView,
  Animated,
  Vibration,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';

const { width, height } = Dimensions.get('window');

export default function StartSessionScreen({ navigation }) {
  const { 
    isSessionActive, 
    sessionTime, 
    sessionXp,
    startSession,
    endSession,
    activeTool,
    metronomeBpm,
    isMetronomeOn,
    tunerNote,
    tunerCents,
    isRecording,
    sessionNotes,
    toggleTool,
    updateMetronomeBpm,
    toggleMetronome,
    updateTuner,
    toggleRecording,
    updateSessionNotes
  } = useSession();

  const [currentView, setCurrentView] = useState('welcome'); // welcome, active, paused
  const [pulseAnim] = useState(new Animated.Value(1));

  // Auto-start session when component mounts
  useEffect(() => {
    if (!isSessionActive) {
      startSession();
      setCurrentView('active');
    }
  }, []);

  // Pulse animation for active session
  useEffect(() => {
    if (isSessionActive && currentView === 'active') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isSessionActive, currentView]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseSession = () => {
    Vibration.vibrate(50);
    setCurrentView('paused');
  };

  const handleResumeSession = () => {
    Vibration.vibrate(50);
    setCurrentView('active');
  };

  const handleStopSession = () => {
    Vibration.vibrate(200);
    endSession();
    setCurrentView('welcome');
  };

  const handleQuickAction = (action) => {
    Vibration.vibrate(50);
    switch (action) {
      case 'pause':
        if (currentView === 'active') {
          handlePauseSession();
        } else {
          handleResumeSession();
        }
        break;
      case 'goals':
        // Navigate to goals or show goals modal
        break;
    }
  };

  const handleToolNavigation = (tool) => {
    Vibration.vibrate(50);
    toggleTool(tool);
  };

  const handleBackToMain = () => {
    Vibration.vibrate(50);
    toggleTool(null);
  };

  // Render Practice Tools
  const renderMetronome = () => (
    <View style={styles.toolPage}>
      <View style={styles.toolPageHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.toolPageTitle}>Metronome</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.toolPageContent}>
        <View style={styles.metronomeVisual}>
          <Ionicons name="musical-notes" size={80} color="#3D9CFF" />
          <Text style={styles.metronomeBpmDisplay}>{metronomeBpm}</Text>
          <Text style={styles.metronomeBpmLabel}>BPM</Text>
        </View>
        
        <View style={styles.bpmControls}>
          <TouchableOpacity 
            style={styles.bpmButton}
            onPress={() => updateMetronomeBpm(metronomeBpm - 5)}
          >
            <Ionicons name="remove" size={32} color="#3D9CFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.bpmButton}
            onPress={() => updateMetronomeBpm(metronomeBpm + 5)}
          >
            <Ionicons name="add" size={32} color="#3D9CFF" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.metronomeMainButton, isMetronomeOn && styles.metronomeMainButtonActive]}
          onPress={toggleMetronome}
        >
          <Ionicons name={isMetronomeOn ? "stop" : "play"} size={40} color="#FFFFFF" />
          <Text style={styles.metronomeMainButtonText}>
            {isMetronomeOn ? 'Stop' : 'Start'} Metronome
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTuner = () => (
    <View style={styles.toolPage}>
      <View style={styles.toolPageHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.toolPageTitle}>Tuner</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.toolPageContent}>
        <View style={styles.tunerVisual}>
          <Text style={styles.tunerNoteDisplay}>{tunerNote}</Text>
          <Text style={styles.tunerCentsDisplay}>{tunerCents > 0 ? '+' : ''}{tunerCents}¢</Text>
        </View>
        
        <View style={styles.tunerIndicator}>
          <View style={[styles.tunerBar, { left: `${50 + (tunerCents / 2)}%` }]} />
        </View>
        
        <Text style={styles.tunerHint}>Play a note to tune</Text>
        
        <TouchableOpacity style={styles.tunerMainButton}>
          <Ionicons name="mic" size={32} color="#000000" />
          <Text style={styles.tunerMainButtonText}>Use Tuner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecorder = () => (
    <View style={styles.toolPage}>
      <View style={styles.toolPageHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.toolPageTitle}>Recorder</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.toolPageContent}>
        <View style={styles.recorderVisual}>
          <Ionicons name="mic" size={80} color={isRecording ? "#FF4444" : "#3D9CFF"} />
          {isRecording && (
            <View style={styles.recordingPulse}>
              <View style={styles.recordingRing} />
              <View style={styles.recordingRing2} />
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.recorderMainButton, isRecording && styles.recorderMainButtonActive]}
          onPress={toggleRecording}
        >
          <Ionicons name={isRecording ? "stop" : "mic"} size={40} color="#FFFFFF" />
          <Text style={styles.recorderMainButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
        
        {isRecording && (
          <View style={styles.recordingStatus}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording in progress...</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderNotes = () => (
    <View style={styles.toolPage}>
      <View style={styles.toolPageHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToMain}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.toolPageTitle}>Session Notes</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.toolPageContent}>
        <Text style={styles.notesDescription}>
          Record your thoughts, progress, and goals for this practice session
        </Text>
        
        <TextInput
          style={styles.notesMainInput}
          placeholder="Write your practice notes here..."
          placeholderTextColor="#A1A1A1"
          value={sessionNotes}
          onChangeText={updateSessionNotes}
          multiline
          textAlignVertical="top"
        />
        
        <View style={styles.notesActions}>
          <TouchableOpacity style={styles.notesSaveButton}>
            <Ionicons name="save" size={20} color="#FFFFFF" />
            <Text style={styles.notesSaveButtonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'metronome':
        return renderMetronome();
      case 'tuner':
        return renderTuner();
      case 'recorder':
        return renderRecorder();
      case 'notes':
        return renderNotes();
      default:
        return null;
    }
  };

  // Active Session Screen
  if (currentView === 'active') {
    // If a tool is active, show the tool page
    if (activeTool) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
          {renderActiveTool()}
        </SafeAreaView>
      );
    }

    // Main session view
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.sessionTitle}>🎵 Practice Session</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
          
          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
              <Text style={styles.timerLabel}>Session Time</Text>
              <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
              <Text style={styles.timerUnit}>minutes</Text>
            </Animated.View>
          </View>

          {/* Session Control Buttons */}
          <View style={styles.headerSessionControls}>
            <TouchableOpacity style={styles.headerPauseButton} onPress={() => handleQuickAction('pause')}>
              <Ionicons name="pause" size={20} color="#FFFFFF" />
              <Text style={styles.headerPauseButtonText}>Pause</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.headerStopButton} onPress={handleStopSession}>
              <Ionicons name="stop" size={20} color="#FFFFFF" />
              <Text style={styles.headerStopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>

          {/* XP Display */}
          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>Session XP</Text>
            <Text style={styles.xpValue}>+{sessionXp} XP</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Practice Tools Navigation */}
          <View style={styles.toolsSection}>
            <Text style={styles.toolsTitle}>Practice Tools</Text>
            <Text style={styles.toolsSubtitle}>Tap to access essential practice tools</Text>
            
            <View style={styles.toolsGrid}>
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => handleToolNavigation('metronome')}
              >
                <Ionicons name="musical-notes" size={32} color="#3D9CFF" />
                <Text style={styles.toolCardText}>Metronome</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => handleToolNavigation('tuner')}
              >
                <Ionicons name="radio" size={32} color="#FFD700" />
                <Text style={styles.toolCardText}>Tuner</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => handleToolNavigation('recorder')}
              >
                <Ionicons name="mic" size={32} color="#FF4444" />
                <Text style={styles.toolCardText}>Recorder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => handleToolNavigation('notes')}
              >
                <Ionicons name="create-outline" size={32} color="#4CAF50" />
                <Text style={styles.toolCardText}>Notes</Text>
              </TouchableOpacity>
            </View>
          </View>


        </View>
      </SafeAreaView>
    );
  }

  // Paused Session Screen
  if (currentView === 'paused') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0A0A" />
        
        {/* Paused Header */}
        <View style={styles.pausedHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.sessionTitle}>⏸️ Session Paused</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={24} color="#B0B0B0" />
            </TouchableOpacity>
          </View>
          
          {/* Timer Display */}
          <View style={styles.timerContainer}>
            <View style={styles.timerCircle}>
              <Text style={styles.timerLabel}>Session Time</Text>
              <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
              <Text style={styles.timerUnit}>minutes</Text>
            </View>
          </View>
        </View>

        {/* Paused Content */}
        <View style={styles.pausedContent}>
          <View style={styles.pausedMessage}>
            <Ionicons name="pause-circle" size={64} color="#FFA500" />
            <Text style={styles.pausedTitle}>Session Paused</Text>
            <Text style={styles.pausedSubtitle}>
              Your practice session is on hold. Resume when you're ready to continue.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.pausedActions}>
            <TouchableOpacity style={styles.resumeButton} onPress={handleResumeSession}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.resumeButtonText}>Resume Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.stopButton} onPress={handleStopSession}>
              <Ionicons name="stop" size={24} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>End Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  

  
  // Session Active Styles
  sessionHeader: {
    backgroundColor: '#1A1A1A',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  timerCircle: {
    backgroundColor: '#2A2A2A',
    borderRadius: 120,
    padding: 40,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3D9CFF',
    shadowColor: '#3D9CFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
    fontWeight: '500',
  },
  timerValue: {
    fontSize: 42,
    fontWeight: '900',
    color: '#3D9CFF',
    fontFamily: 'monospace',
  },
  timerUnit: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
    fontWeight: '500',
  },
  xpContainer: {
    alignItems: 'center',
  },
  xpLabel: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  xpValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
  },
  
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  
  // Practice Tools Section
  toolsSection: {
    marginBottom: 40,
  },
  toolsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  toolsSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  toolCardText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  
  // Tool Page Styles
  toolPage: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  toolPageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  toolPageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  toolPageContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  
  // Metronome Page Styles
  metronomeVisual: {
    alignItems: 'center',
    marginBottom: 40,
  },
  metronomeBpmDisplay: {
    fontSize: 72,
    fontWeight: '900',
    color: '#3D9CFF',
    marginTop: 20,
  },
  metronomeBpmLabel: {
    fontSize: 18,
    color: '#B0B0B0',
    fontWeight: '600',
  },
  bpmControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  bpmButton: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  metronomeMainButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3D9CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  metronomeMainButtonActive: {
    backgroundColor: '#FF4444',
  },
  metronomeMainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  
  // Tuner Page Styles
  tunerVisual: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tunerNoteDisplay: {
    fontSize: 80,
    fontWeight: '900',
    color: '#3D9CFF',
  },
  tunerCentsDisplay: {
    fontSize: 24,
    color: '#B0B0B0',
    marginTop: 12,
    fontWeight: '600',
  },
  tunerIndicator: {
    width: '80%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 30,
    position: 'relative',
  },
  tunerBar: {
    position: 'absolute',
    width: 8,
    height: '100%',
    backgroundColor: '#3D9CFF',
    borderRadius: 4,
    top: 0,
  },
  tunerHint: {
    color: '#B0B0B0',
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  tunerMainButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  tunerMainButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  
  // Recorder Page Styles
  recorderVisual: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  recordingPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FF4444',
    opacity: 0.6,
  },
  recordingRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#FF4444',
    opacity: 0.3,
  },
  recorderMainButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 24,
    paddingHorizontal: 48,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#3D9CFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  recorderMainButtonActive: {
    backgroundColor: '#FF4444',
  },
  recorderMainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    marginRight: 12,
  },
  recordingText: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Notes Page Styles
  notesDescription: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  notesMainInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    minHeight: 200,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
    width: '100%',
  },
  notesActions: {
    marginTop: 30,
    alignItems: 'center',
  },
  notesSaveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notesSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  

  
  // Paused Session Styles
  pausedHeader: {
    backgroundColor: '#1A1A1A',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pausedContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  pausedMessage: {
    alignItems: 'center',
    paddingTop: 60,
  },
  pausedTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  pausedSubtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pausedActions: {
    paddingBottom: 40,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  headerSessionControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  headerPauseButton: {
    backgroundColor: '#FFA500', // Orange color for pause
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 100,
  },
  headerPauseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  headerStopButton: {
    backgroundColor: '#FF4444', // Red color for stop
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 100,
  },
  headerStopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});
