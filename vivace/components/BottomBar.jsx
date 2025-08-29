import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';

// Import your tab screens
import HomeScreen from '../screens/Home';
import StartSessionScreen from '../screens/StartSession';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

const BottomBar = ({ onLogout }) => {
  const { isSessionActive } = useSession();

  // Custom button component for the session tab
  const SessionButton = ({ children, onPress }) => (
    <TouchableOpacity
      style={styles.sessionButtonContainer}
      onPress={onPress}
    >
      <View style={styles.sessionButton}>
        {children}
      </View>
    </TouchableOpacity>
  );

  const renderNormalBottomBar = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3D9CFF', 
        tabBarInactiveTintColor: '#6c757d',   
        tabBarStyle: {
          backgroundColor: '#FFFFFF',     
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          height: 90, 
          paddingBottom: 20, 
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          color: '#1E1E1E',
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
          tabBarButton: (props) => (
            <SessionButton {...props}>
              <Ionicons 
                name={isSessionActive ? 'pause-circle' : 'play-circle'} 
                size={48} 
                color="#FFFFFF" 
                backgroundColor="transparent"
              />
            </SessionButton>
          ),
          tabBarLabel: 'Session',
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
  sessionButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionButton: {
    backgroundColor: '#3D9CFF',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3D9CFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 7,
    elevation: 8,
  },
});

export default BottomBar;
