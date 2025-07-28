import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Welcome.jsx';
import LoginPage from '../screens/Login.jsx';
import EmailRegisterScreen from '../screens/EmailRegister.jsx';

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
        {(props) => <LoginPage {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
      <AuthStack.Screen
        name="EmailRegister"
        component={EmailRegisterScreen}
        options={{ title: 'Sign Up with Email' }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;