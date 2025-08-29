import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';

// Import your tab screens
import HomeScreen from '../screens/Home';
import StartSessionScreen from '../screens/StartSession';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

const BottomBar = ({ onLogout }) => {
  const { isSessionActive } = useSession();

  const renderNormalBottomBar = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'StartSessionTab') {
            iconName = focused ? 'play-circle' : 'play-circle-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3D9CFF', 
        tabBarInactiveTintColor: '#A1A1A1',   
        tabBarStyle: {
          backgroundColor: '#1E1E1E',     
          borderTopWidth: 1,
          borderTopColor: '#333',
          height: 90, 
          paddingBottom: 20, 
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#EAEAEA',
        },
        headerShown: false, 
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home', 
        }}
      />
      <Tab.Screen
        name="StartSessionTab"
        component={StartSessionScreen}
        options={{
          title: 'Session', 
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{
          title: 'Profile',
        }}
      >
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

  // Show normal bottom bar (practice tools are now integrated into StartSession)
  return renderNormalBottomBar();
};

const styles = StyleSheet.create({
  // Styles removed since they're no longer needed
});

export default BottomBar;
