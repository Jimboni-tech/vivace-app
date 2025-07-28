import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home.jsx';

const AppStack = createNativeStackNavigator();

const AppStackNavigator = ({ onLogout }) => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Home"
        options={{ headerShown: false }}
      >
        {(props) => <HomeScreen {...props} onLogout={onLogout} />}
      </AppStack.Screen>
    </AppStack.Navigator>
  );
};

export default AppStackNavigator;