import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PracticeSessionBar = () => {
  const tools = [
    { icon: 'musical-notes' },
    { icon: 'speedometer' },
    { icon: 'mic' },
    { icon: 'document-text' }
  ];

  return (
    <View style={styles.container}>
      {tools.map((tool, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.toolButton}
          activeOpacity={0.6}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={tool.icon} size={28} color="#deddddff" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#3D9CFF',
    height: 90,
    paddingBottom: 20,
    paddingTop: 10,
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 55,
    height: 55,
    backgroundColor: '#7BB9FF',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  }
});

export default PracticeSessionBar;