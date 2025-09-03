import React from 'react';
import { Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';

// Import your tab screens
import HomeScreen from '../screens/Home';
import StatsScreen from '../screens/Stats';
import ProfileScreen from '../screens/Profile';
import PracticeStackNavigator from '../navigation/PracticeStackNavigator';

const Tab = createBottomTabNavigator();

const BottomBar = ({ onLogout }) => {
  const { isSessionActive, startSession } = useSession();
  const navigation = useNavigation();

  const handleSessionPress = () => {
    if (!isSessionActive) {
      Alert.alert(
        "Start Practice Session",
        "Would you like to start a new practice session?",
        [
          {
            text: "No",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => {
              startSession();
              // Navigate to the Practice tab first, then to the PracticeSession screen explicitly
              navigation.navigate('Practice', { screen: 'PracticeSession' });
            }
          }
        ]
      );
    }
  };

  // Custom button component for the session tab
  const SessionButton = ({ children, onPress }) => (
    <TouchableOpacity
      style={styles.sessionButtonContainer}
      onPress={handleSessionPress}
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

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }
          return <Ionicons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: '#3D9CFF',
        tabBarInactiveTintColor: '#6c757d',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          height: 80,
          paddingBottom: 20,
          paddingTop: 5,
          display: isSessionActive ? 'none' : 'flex',
        },
        tabBarShowLabel: false, // Hide labels
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Friends"
        component={HomeScreen}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeStackNavigator}
        options={{
          tabBarButton: (props) => (
            <SessionButton {...props}>
              <Ionicons
                name={isSessionActive ? 'pause' : 'play'}
                size={30}
                color="#FFFFFF"
              />
            </SessionButton>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
      />
      <Tab.Screen
        name="Profile"
      >
        {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

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
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3D9CFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 8,
  },
});

export default BottomBar;