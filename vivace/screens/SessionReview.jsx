import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

const SessionReview = ({ navigation, route }) => {
  const { 
    sessionData, 
    endSessionAndSave, 
    resumeSession, 
    sessionNotes,
    updateSessionNotes,
    endSession
  } = useSession();
  const [title, setTitle] = useState(sessionData?.title || 'Practice Session');
  
  // Use notes from route params (if coming from practice session) or fallback to session context notes
  const notesFromPractice = route.params?.notes;
  const [notes, setNotes] = useState(notesFromPractice || sessionNotes || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if we're coming from the practice session
  const fromPractice = route.params?.fromPractice || false;

  // Format session duration for display
  const formatDuration = (seconds) => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  // Use effect to ensure notes are updated if sessionNotes changes
  useEffect(() => {
    // Only update notes if they haven't been edited yet
    if (notes === '' && (notesFromPractice || sessionNotes)) {
      setNotes(notesFromPractice || sessionNotes || '');
    }
  }, [notesFromPractice, sessionNotes]);

  const handleSaveSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      // Update session data with title and notes
      const updatedSession = {
        ...sessionData,
        title,
        notes
      };

      // If we came from practice session, we need to properly end it first
      if (fromPractice) {
        // First update the session notes to ensure they're included in endSession
        await updateSessionNotes(notes);
        
        // End the session to update all relevant data
        const { sessionData: endedSessionData } = await endSession();
        
        // Merge the ended session data with our updates
        const finalSessionData = {
          ...endedSessionData,
          title,
          notes
        };
        
        // Save the merged session data
        await endSessionAndSave(finalSessionData);
      } else {
        // Just save the updated session
        await endSessionAndSave(updatedSession);
      }
      
      // Navigate to home tab
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      console.error('Error saving session:', err);
      setError('Failed to save session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // If we came from a practice session, resume it and go back
    if (fromPractice) {
      resumeSession();
      navigation.goBack();
    } else {
      // Otherwise just go back (this handles other navigation scenarios)
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Review Session</Text>

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveSession}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3D9CFF" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save</Text>

              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={22} color="#3D9CFF" />
            <Text style={styles.sectionTitle}>Session Details</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Session Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a meaningful title for your session"
              placeholderTextColor="#A0AEC0"
              maxLength={100}
            />
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={20} color="white" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>
                  {formatDuration(sessionData?.duration)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="white" />
              </View>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create-outline" size={22} color="#3D9CFF" />
            <Text style={styles.sectionTitle}>Practice Notes</Text>
          </View>
          
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Write your notes here!"
            placeholderTextColor="#A0AEC0"
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <Text style={styles.charCount}>{notes.length}/2000</Text>
        </View>

        {sessionData?.recordings && sessionData.recordings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="musical-notes-outline" size={22} color="#3D9CFF" />
              <Text style={styles.sectionTitle}>Recordings</Text>
            </View>
            
            <View style={styles.recordingsContainer}>
              {sessionData.recordings.map((recording, index) => (
                <View key={index} style={styles.recordingItem}>
                  <View style={styles.recordingIconContainer}>
                    <Ionicons name="musical-note" size={18} color="white" />
                  </View>
                  <View>
                    <Text style={styles.recordingTitle}>Recording {index + 1}</Text>
                    <Text style={styles.recordingText}>
                      {formatDuration(recording.duration)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#3D9CFF',
    borderBottomWidth: 1,
    borderBottomColor: '#2D8BEE',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#3D9CFF',
    fontFamily: 'Nunito-Bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#4A5568',
    fontFamily: 'Nunito-Bold',
  },
  titleInput: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  notesInput: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 150,
    fontFamily: 'Nunito-Regular',
    textAlignVertical: 'top',
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#718096',
    marginTop: 8,
    fontFamily: 'Nunito-Regular',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  detailIconContainer: {
    backgroundColor: '#3D9CFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#718096',
    fontFamily: 'Nunito-Regular',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    fontFamily: 'Nunito-Bold',
  },
  recordingsContainer: {
    marginTop: 5,
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordingIconContainer: {
    backgroundColor: '#3D9CFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
    fontFamily: 'Nunito-Bold',
  },
  recordingText: {
    fontSize: 14,
    color: '#718096',
    fontFamily: 'Nunito-Regular',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 4,
    fontFamily: 'Nunito-Bold',
  },
  saveButtonText: {
    color: '#3D9CFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 4,
    fontFamily: 'Nunito-Bold',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
});

export default SessionReview;
