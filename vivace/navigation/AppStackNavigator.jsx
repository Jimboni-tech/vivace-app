import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native'; // Import SafeAreaView
import HomeScreen from '../screens/Home.jsx';
import TunerScreen from '../screens/Tuner.jsx';
import MetronomeScreen from '../screens/Metronome.jsx';
import RecordingScreen from '../screens/Recording.jsx';
import PracticeSessionScreen from '../screens/PracticeSession.jsx';

const AppStack = createNativeStackNavigator();

const AppStackNavigator = ({ onLogout }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}> {/* Wrap the navigator in SafeAreaView */}
      <AppStack.Navigator>
        <AppStack.Screen
          name="Home"
          options={{ headerShown: false }}
        >
          {(props) => <HomeScreen {...props} onLogout={onLogout} />}
        </AppStack.Screen>
        <AppStack.Screen
          name="PracticeSession"
          component={PracticeSessionScreen}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="Tuner"
          component={TunerScreen}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="Metronome"
          component={MetronomeScreen}
          options={{ headerShown: false }}
        />
        <AppStack.Screen
          name="Recording"
          component={RecordingScreen}
          options={{ headerShown: false }}
        />
      </AppStack.Navigator>
    </SafeAreaView>
  );
};

export default AppStackNavigator;