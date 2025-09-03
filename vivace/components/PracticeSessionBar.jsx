import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TunerForkIcon from '../assets/tunerfork.svg';
import { DEFAULT_THEME, BASE_COLORS } from '../constants/theme';

const PracticeSessionBar = ({ paused, onPauseToggle, onTunerPress, onMetronomePress, onRecordingPress, onNotesPress }) => {

  const tools = [
    { icon: 'tunerfork', type: 'custom' },
    { icon: 'metronome', type: 'material' },
    { icon: 'mic', type: 'ion' }, // microphone for recording
    { icon: 'document-text', type: 'ion' }
  ];


  const handleToolPress = (tool) => {
    switch (tool.icon) {
      case 'tunerfork':
        onTunerPress && onTunerPress();
        break;
      case 'metronome':
        onMetronomePress && onMetronomePress();
        break;
      case 'mic':
        onRecordingPress && onRecordingPress();
        break;
      case 'document-text':
        onNotesPress && onNotesPress();
        break;
      default:
        break;
    }
  };

  // Split tools for left/right of pause button
  const leftTools = tools.slice(0, 2);
  const rightTools = tools.slice(2);


  const renderIcon = (tool) => {
    if (tool.type === 'custom' && tool.icon === 'tunerfork') {
      return <TunerForkIcon width={28} height={28} fill={BASE_COLORS.white} />;
    }
    if (tool.type === 'material') {
      return <MaterialCommunityIcons name={tool.icon} size={28} color={BASE_COLORS.white} />;
    }
    return <Ionicons name={tool.icon} size={28} color={BASE_COLORS.white} />;
  };

  return (
    <View style={styles.container}>
      {leftTools.map((tool, index) => (
        <TouchableOpacity
          key={tool.icon}
          style={styles.toolButton}
          activeOpacity={0.6}
          onPress={() => handleToolPress(tool)}
        >
          <View style={styles.iconContainer}>
            {renderIcon(tool)}
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
          color={DEFAULT_THEME.button.primaryBackground}
        />
      </TouchableOpacity>
      {rightTools.map((tool, index) => (
        <TouchableOpacity
          key={tool.icon}
          style={styles.toolButton}
          activeOpacity={0.6}
          onPress={() => handleToolPress(tool)}
        >
          <View style={styles.iconContainer}>
            {renderIcon(tool)}
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
    backgroundColor: DEFAULT_THEME.practiceSession.background,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  pauseButton: {
    width: 55,
    height: 55,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DEFAULT_THEME.practiceSession.background,
    marginLeft: 10,
    elevation: 5
  },
  pauseButtonActive: {
    width: 55,
    height: 55,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DEFAULT_THEME.practiceSession.background,
    marginLeft: 10,
    elevation: 5,
    opacity: 0.7
  }
});

export default PracticeSessionBar;
