import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native'; // Import SafeAreaView
import HomeScreen from '../screens/Home.jsx';

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
      </AppStack.Navigator>
    </SafeAreaView>
  );
};

export default AppStackNavigator;