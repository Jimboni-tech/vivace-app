import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Welcome';
import LoginScreen from '../screens/Auth/Login';
import EmailRegisterScreen from '../screens/Auth/EmailRegister';

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
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
