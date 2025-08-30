import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PracticeSessionBar = ({ paused, onPauseToggle }) => {
  const tools = [
    { icon: 'musical-notes' },
    { icon: 'speedometer' },
    { icon: 'mic' },
    { icon: 'document-text' }
  ];

  // Split tools for left/right of pause button
  const leftTools = tools.slice(0, 2);
  const rightTools = tools.slice(2);

  return (
    <View style={styles.container}>
      {leftTools.map((tool, index) => (
        <TouchableOpacity 
          key={tool.icon}
          style={styles.toolButton}
          activeOpacity={0.6}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={tool.icon} size={28} color="#deddddff" />
          </View>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={paused ? styles.pauseButtonActive : styles.pauseButton}
        onPress={onPauseToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={paused ? 'play' : 'pause'}
          size={28}
          color={'#3D9CFF'}
        />
      </TouchableOpacity>
      {rightTools.map((tool, index) => (
        <TouchableOpacity 
          key={tool.icon}
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
  },
  pauseButton: {
    width: 55,
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3D9CFF',
    marginLeft: 10,
    elevation: 5
  },
  pauseButtonActive: {
    width: 55,
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3D9CFF',
    marginLeft: 10,
    elevation: 5,
    opacity: 0.7
  }
});

export default PracticeSessionBar;