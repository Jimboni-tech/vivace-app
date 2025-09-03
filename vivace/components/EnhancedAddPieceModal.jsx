import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { sessionApi } from '../utils/apiClient';


const EnhancedAddSongModal = ({ visible, onClose, sessionId, onSongAdded }) => {
  const [type, setType] = useState(''); // '' | 'song' | 'exercise'
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typeDropdown, setTypeDropdown] = useState(false);

  const resetForm = () => {
    setType('');
    setTitle('');
    setComposer('');
    setTimeSpent('');
    setNotes('');
    setError(null);
    setTypeDropdown(false);
  };

  const validateForm = () => {
    if (!type) {
      setError('Please select a type.');
      return false;
    }
    if (!title.trim()) {
      setError(type === 'song' ? 'Song title is required' : 'Exercise name is required');
      return false;
    }
    if (type === 'song' && !composer.trim()) {
      setError('Composer is required for songs');
      return false;
    }
    return true;
  };

  const handleAddSong = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      setError(null);
      const songData = {
        title: title.trim(),
        type,
        timeSpent: timeSpent ? parseInt(timeSpent, 10) : 0,
        notes: notes.trim(),
        ...(type === 'song' ? { composer: composer.trim() } : {})
      };
      const response = await sessionApi.addPiece(sessionId, songData); // TODO: rename addPiece to addSong in apiClient
      resetForm();
      if (onSongAdded) onSongAdded(response);
      onClose();
    } catch (err) {
      setError('Failed to add. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.centeredView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.modalView}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>Add Song or Exercise</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#3D9CFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <TouchableOpacity
                style={[styles.input, { flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => setTypeDropdown(!typeDropdown)}
              >
                <Text style={{ flex: 1, color: type ? '#222' : '#A0AEC0' }}>
                  {type ? (type === 'song' ? 'Song' : 'Exercise') : 'Select type'}
                </Text>
                <Ionicons name={typeDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#A0AEC0" />
              </TouchableOpacity>
              {typeDropdown && (
                <View style={{ backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginTop: 4 }}>
                  <TouchableOpacity style={{ padding: 14 }} onPress={() => { setType('song'); setTypeDropdown(false); }}>
                    <Text style={{ color: '#222' }}>Song</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ padding: 14 }} onPress={() => { setType('exercise'); setTypeDropdown(false); }}>
                    <Text style={{ color: '#222' }}>Exercise</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {type !== '' && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>{type === 'song' ? 'Song Title' : 'Exercise Name'}</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder={type === 'song' ? 'Enter song title' : 'Enter exercise name'}
                    placeholderTextColor="#A0AEC0"
                  />
                </View>
                {type === 'song' && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Composer</Text>
                    <TextInput
                      style={styles.input}
                      value={composer}
                      onChangeText={setComposer}
                      placeholder="Enter composer name"
                      placeholderTextColor="#A0AEC0"
                    />
                  </View>
                )}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Time Spent (minutes)</Text>
                  <TextInput
                    style={styles.input}
                    value={timeSpent}
                    onChangeText={(text) => setTimeSpent(text.replace(/[^0-9]/g, ''))}
                    placeholder="Enter time (optional)"
                    placeholderTextColor="#A0AEC0"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Enter notes (optional)"
                    placeholderTextColor="#A0AEC0"
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              </>
            )}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddSong}
                disabled={loading || !type}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.addButtonText}>
                    Add {type === 'song' ? 'Song' : type === 'exercise' ? 'Exercise' : ''}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D9CFF',
    fontFamily: 'Nunito-Bold',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#4A5568',
    fontFamily: 'Nunito-Bold',
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
  },
  textArea: {
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  footer: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#3D9CFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#3D9CFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#3D9CFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
});

export default EnhancedAddSongModal;
