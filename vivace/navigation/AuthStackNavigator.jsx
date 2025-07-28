import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/Welcome.jsx';
import LoginPage from '../screens/Auth/Login.jsx';
import EmailRegisterScreen from '../screens/Auth/EmailRegister.jsx';

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
        options={{ title: 'Sign Up with Email' }}
      >
        {/* Pass the onLoginSuccess prop to EmailRegisterScreen */}
        {(props) => <EmailRegisterScreen {...props} onLoginSuccess={onLoginSuccess} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};

export default AuthStackNavigator;
