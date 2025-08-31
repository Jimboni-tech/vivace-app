import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Tuner() {
  const [note, setNote] = useState('A');
  const [cents, setCents] = useState(0);

  return (
    <View style={styles.featureContainer}>
      <View style={styles.tunerContainer}>
        <View style={styles.noteContainer}>
          <Text style={styles.noteText}>{note}</Text>
        </View>
        <View style={styles.needleContainer}>
          <View style={[styles.needle, { transform: [{ rotate: `${cents}deg` }] }]} />
        </View>
        <View style={styles.centsContainer}>
          <Text style={styles.centsText}>{cents > 0 ? `+${cents}` : cents}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featureContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tunerContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContainer: {
    position: 'absolute',
    top: 0,
  },
  noteText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Nunito-Bold',
  },
  needleContainer: {
    width: 2,
    height: 100,
    backgroundColor: 'white',
    position: 'absolute',
    top: 50,
    left: 99,
  },
  needle: {
    width: 2,
    height: 100,
    backgroundColor: 'red',
  },
  centsContainer: {
    position: 'absolute',
    bottom: 0,
  },
  centsText: {
    fontSize: 24,
    color: 'white',
    fontFamily: 'Nunito-Regular',
  },
});