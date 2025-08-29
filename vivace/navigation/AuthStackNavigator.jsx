import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Welcome';
import LoginScreen from '../screens/Auth/Login';
import EmailRegisterScreen from '../screens/Auth/EmailRegister';
import ProfileSetupScreen from '../screens/Auth/ProfileSetup';
import MusicalProfileScreen from '../screens/Auth/MusicalProfile';
import PracticeGoalsScreen from '../screens/Auth/PracticeGoals';

const AuthStack = createNativeStackNavigator();

const AuthStackNavigator = ({ onLoginSuccess }) => {
  return (
    <AuthStack.Navigator initialRouteName="Welcome">
      <AuthStack.Screen
        name="Welcome"
        options={{ headerShown: false }}
      >
        {(props) => <WelcomeScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="Login"
        options={{ headerShown: false }}
      >
        {(props) => <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="EmailRegister"
        options={{ headerShown: false }}
      >
        {(props) => <EmailRegisterScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="ProfileSetup"
        options={{ headerShown: false }}
      >
        {(props) => <ProfileSetupScreen {...props} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="MusicalProfile"
        options={{ headerShown: false }}
      >
        {(props) => <MusicalProfileScreen {...props} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="PracticeGoals"
        options={{ headerShown: false }}
      >
        {(props) => <PracticeGoalsScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
