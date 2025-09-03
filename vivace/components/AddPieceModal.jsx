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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { sessionApi } from '../utils/apiClient';

const AddPieceModal = ({ visible, onClose, sessionId, onPieceAdded }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('piece');
  const [timeSpent, setTimeSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Exercise/piece types
  const types = [
    { label: 'Piece', value: 'piece' },
    { label: 'Scales', value: 'scales' },
    { label: 'Arpeggios', value: 'arpeggios' },
    { label: 'Etudes', value: 'etudes' },
    { label: 'Technique', value: 'technique' },
    { label: 'Other', value: 'other' }
  ];

  const handleAddPiece = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pieceData = {
        title: title.trim(),
        type,
        timeSpent: timeSpent ? parseInt(timeSpent, 10) : 0,
        notes: notes.trim()
      };

      const response = await sessionApi.addPiece(sessionId, pieceData);
      
      // Reset form
      setTitle('');
      setType('piece');
      setTimeSpent('');
      setNotes('');
      
      // Call the callback with the updated session
      if (onPieceAdded) {
        onPieceAdded(response);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error adding piece:', err);
      setError('Failed to add piece. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Add {type === 'piece' ? 'Piece' : 'Exercise'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#3D9CFF" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter title"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={type}
                  onValueChange={(itemValue) => setType(itemValue)}
                  style={styles.picker}
                >
                  {types.map((item) => (
                    <Picker.Item key={item.value} label={item.label} value={item.value} />
                  ))}
                </Picker>
              </View>
            </View>
            
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
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleAddPiece}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
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
  },
  button: {
    backgroundColor: '#3D9CFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
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

export default AddPieceModal;
