import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Main blue color and a lighter version for the text input
const MAIN_BLUE = '#3D9CFF';
const LIGHT_BLUE = '#8CC5FF'; // Lighter shade of the main blue

const NotesModal = ({ visible, onClose, onSave, initialNote = '' }) => {
  const [note, setNote] = useState('');
  
  useEffect(() => {
    if (visible) {
      setNote(initialNote);
    }
  }, [visible, initialNote]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notes</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.noteInput}
                multiline
                placeholder="Write your notes here!"
                placeholderTextColor="#ffffff99"
                value={note}
                onChangeText={setNote}
                autoFocus
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '90%',
    maxWidth: 500,
  },
  modalContent: {
    backgroundColor: MAIN_BLUE,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff50',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Nunito-Bold',
  },
  closeButton: {
    padding: 5,
  },
  noteInput: {
    padding: 15,
    height: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: LIGHT_BLUE,
    fontFamily: 'Nunito-Regular',
    color: '#FFFFFF',
    borderRadius: 15    
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  saveButtonText: {
    color: MAIN_BLUE,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Nunito-Bold',
  },
});

export default NotesModal;
