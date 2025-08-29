import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';

const SessionNavBar = () => {
  const [activeTool, setActiveTool] = useState(null);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [tunerNote, setTunerNote] = useState('A');
  const [tunerCents, setTunerCents] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState('');

  const renderMetronome = () => (
    <View style={styles.toolContent}>
      <Text style={styles.toolTitle}>Metronome</Text>
      <View style={styles.bpmContainer}>
        <TouchableOpacity onPress={() => setMetronomeBpm(Math.max(40, metronomeBpm - 5))}>
          <Text style={styles.bpmButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.bpmText}>{metronomeBpm} BPM</Text>
        <TouchableOpacity onPress={() => setMetronomeBpm(Math.min(240, metronomeBpm + 5))}>
          <Text style={styles.bpmButton}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[styles.metronomeButton, isMetronomeOn && styles.metronomeButtonActive]}
        onPress={() => {
          setIsMetronomeOn(!isMetronomeOn);
        }}
      >
        <Text style={styles.metronomeButtonText}>
          {isMetronomeOn ? 'Stop' : 'Start'} Metronome
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTuner = () => (
    <View style={styles.toolContent}>
      <Text style={styles.toolTitle}>Tuner</Text>
      <View style={styles.tunerDisplay}>
        <Text style={styles.tunerNote}>{tunerNote}</Text>
        <Text style={styles.tunerCents}>{tunerCents > 0 ? '+' : ''}{tunerCents}¢</Text>
      </View>
      <View style={styles.tunerIndicator}>
        <View style={[styles.tunerBar, { left: `${50 + (tunerCents / 2)}%` }]} />
      </View>
      <Text style={styles.tunerHint}>Play a note to tune</Text>
      <TouchableOpacity style={styles.tunerButton}>
        <Text style={styles.tunerButtonText}>Use Tuner</Text>
      </TouchableOpacity>
    </View>
  );

  const renderRecorder = () => (
    <View style={styles.toolContent}>
      <Text style={styles.toolTitle}>Recorder</Text>
      <TouchableOpacity 
        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        onPress={() => {
          setIsRecording(!isRecording);
        }}
      >
        <Text style={styles.recordButtonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      {isRecording && (
        <Text style={styles.recordingText}>Recording in progress...</Text>
      )}
    </View>
  );

  const renderNotes = () => (
    <View style={styles.toolContent}>
      <Text style={styles.toolTitle}>Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Write your practice notes here..."
        placeholderTextColor="#A1A1A1"
        value={notes}
        onChangeText={(text) => {
          setNotes(text);
        }}
        multiline
        textAlignVertical="top"
      />
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

  return (
    <View style={styles.sessionNavBar}>
      {/* Tool Buttons */}
      <View style={styles.toolButtons}>
        <TouchableOpacity 
          style={[styles.toolButton, activeTool === 'metronome' && styles.activeToolButton]}
          onPress={() => setActiveTool(activeTool === 'metronome' ? null : 'metronome')}
        >
          <Text style={[styles.toolButtonText, activeTool === 'metronome' && styles.activeToolButtonText]}>
            Metronome
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, activeTool === 'tuner' && styles.activeToolButton]}
          onPress={() => setActiveTool(activeTool === 'tuner' ? null : 'tuner')}
        >
          <Text style={[styles.toolButtonText, activeTool === 'tuner' && styles.activeToolButtonText]}>
            Tuner
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, activeTool === 'recorder' && styles.activeToolButton]}
          onPress={() => setActiveTool(activeTool === 'recorder' ? null : 'recorder')}
        >
          <Text style={[styles.toolButtonText, activeTool === 'recorder' && styles.activeToolButtonText]}>
            Recorder
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, activeTool === 'notes' && styles.activeToolButton]}
          onPress={() => setActiveTool(activeTool === 'notes' ? null : 'notes')}
        >
          <Text style={[styles.toolButtonText, activeTool === 'notes' && styles.activeToolButtonText]}>
            Notes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Tool Content */}
      {activeTool && (
        <View style={styles.toolContentArea}>
          <ScrollView style={styles.toolScrollView}>
            {renderActiveTool()}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sessionNavBar: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: 300,
    // Ensure it stays at the bottom
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  toolButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  toolButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  activeToolButton: {
    backgroundColor: '#3D9CFF',
  },
  toolButtonText: {
    color: '#EAEAEA',
    fontSize: 12,
    fontWeight: '500',
  },
  activeToolButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  toolContentArea: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    maxHeight: 200,
    marginTop: 10,
  },
  toolScrollView: {
    maxHeight: 200,
  },
  toolContent: {
    padding: 20,
    alignItems: 'center',
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginBottom: 20,
  },
  bpmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bpmButton: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D9CFF',
    paddingHorizontal: 20,
  },
  bpmText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAEAEA',
    marginHorizontal: 20,
  },
  metronomeButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  metronomeButtonActive: {
    backgroundColor: '#FF4444',
  },
  metronomeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tunerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  tunerNote: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3D9CFF',
  },
  tunerCents: {
    fontSize: 16,
    color: '#A1A1A1',
    marginTop: 5,
  },
  tunerIndicator: {
    width: '80%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 20,
    position: 'relative',
  },
  tunerBar: {
    position: 'absolute',
    width: 4,
    height: '100%',
    backgroundColor: '#3D9CFF',
    borderRadius: 2,
    top: 0,
  },
  tunerHint: {
    color: '#A1A1A1',
    fontSize: 12,
    marginBottom: 15,
  },
  tunerButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  tunerButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: '#3D9CFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: '#FF4444',
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordingText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 15,
  },
  notesInput: {
    width: '100%',
    height: 120,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 15,
    color: '#EAEAEA',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
});

export default SessionNavBar;
