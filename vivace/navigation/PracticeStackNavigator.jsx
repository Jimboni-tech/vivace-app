import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PracticeSessionScreen from '../screens/PracticeSession.jsx';
import SessionReviewScreen from '../screens/SessionReview.jsx';
import TunerScreen from '../screens/Tuner.jsx';
import MetronomeScreen from '../screens/Metronome.jsx';
import RecordingScreen from '../screens/Recording.jsx';

const PracticeStack = createNativeStackNavigator();

const PracticeStackNavigator = () => {
  return (
    <PracticeStack.Navigator>
      <PracticeStack.Screen
        name="PracticeSession"
        component={PracticeSessionScreen}
        options={{ headerShown: false }}
      />
      <PracticeStack.Screen
        name="SessionReview"
        component={SessionReviewScreen}
        options={{ headerShown: false }}
      />
      <PracticeStack.Screen
        name="Tuner"
        component={TunerScreen}
        options={{ headerShown: false }}
      />
      <PracticeStack.Screen
        name="Metronome"
        component={MetronomeScreen}
        options={{ headerShown: false }}
      />
      <PracticeStack.Screen
        name="Recording"
        component={RecordingScreen}
        options={{ headerShown: false }}
      />
    </PracticeStack.Navigator>
  );
};

export default PracticeStackNavigator;
