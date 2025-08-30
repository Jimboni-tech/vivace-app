import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';


const getUserToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token;
  } catch (e) {
    console.error("Failed to retrieve the token.", e);
    return null;
  }
};
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL
const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('Musician');
  const [userStats, setUserStats] = useState({
    level: 1,
    xp: 0,
    xpToNext: 100,
    streak: 0,
    totalHours: 0,
    weeklyHours: 0
  });
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const friends = [
    { id: 1, name: 'Sarah', level: 8, streak: 12, avatar: '🎻' },
    { id: 2, name: 'Mike', level: 6, streak: 5, avatar: '🎸' },
    { id: 3, name: 'Emma', level: 10, streak: 25, avatar: '🎹' },
    { id: 4, name: 'Alex', level: 4, streak: 3, avatar: '🥁' },
  ];

  const startSession = () => {
    navigation.navigate('StartSessionTab');
  };

  const getXpPercentage = () => {
    if (userStats.xpToNext <= 0) return 0;
    return (userStats.xp / userStats.xpToNext) * 100;
  };

  const fetchWithTimeout = (url, options, timeout = 15000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeout)
      )
    ]);
  };

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    
    // --- THIS IS THE CRITICAL CHANGE ---
    const token = await getUserToken(); // Wait for the token to be retrieved
    // ------------------------------------

    if (!token) {
      setError("Authentication failed. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile and stats
      const profileResponse = await fetchWithTimeout(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("API Error Response:", errorText);
        if (profileResponse.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError(`Server error: ${profileResponse.status}`);
        }
        return;
      }

      const profileData = await profileResponse.json();

      if (profileData.user) {
        const user = profileData.user;
        const displayName = user.profile?.displayName || user.username || 'Musician';
        setUserName(displayName);
        
        setUserStats({
          level: user.stats.level,
          xp: user.stats.totalXP,
          xpToNext: Math.pow(user.stats.level + 1, 2) * 100,
          streak: user.stats.currentStreak,
          totalHours: (user.stats.totalPracticeTime / 60).toFixed(1),
          weeklyHours: 8.2
        });
      }

      // Fetch recent practice sessions
      const sessionsResponse = await fetchWithTimeout(`${API_BASE_URL}/practice/recent?limit=5`, {
          headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!sessionsResponse.ok) {
        const errorText = await sessionsResponse.text();
        console.error("Sessions API Error Response:", errorText);
        setError("Failed to load recent sessions.");
        return;
      }
      
      const sessionsData = await sessionsResponse.json();
      if (sessionsData.sessions) {
        setRecentSessions(sessionsData.sessions);
      } else {
        setRecentSessions([]);
      }

    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (err.message === 'timeout') {
        setError("Network request timed out. Please check your connection.");
      } else {
        setError("Could not load data. Please check your network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);
  
  // ... (rest of your component remains the same)
  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendAvatar}>{item.avatar}</Text>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStats}>Level {item.level} • {item.streak} day streak</Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle" size={24} color="#3D9CFF" />
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Welcome back, {userName}!</Text>
        <Text style={styles.subtitle}>Ready to practice today?</Text>
      </View>

      {/* Loading state indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3D9CFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {/* XP and Level Section */}
          <View style={styles.xpSection}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>Level {userStats.level}</Text>
              <Text style={styles.xpText}>{userStats.xp} / {userStats.xpToNext} XP</Text>
            </View>
            <View style={styles.xpBar}>
              <View style={[styles.xpProgress, { width: `${getXpPercentage()}%` }]} />
            </View>
          </View>

          {/* Streak Section */}
          <View style={styles.streakSection}>
            <Ionicons name="flame" size={24} color="#FF6B35" />
            <Text style={styles.streakText}>{userStats.streak} Day Streak!</Text>
            <Text style={styles.streakSubtext}>Keep it going!</Text>
          </View>

          {/* Quick Start Session */}
          <TouchableOpacity style={styles.startButton} onPress={startSession}>
            <Ionicons name="play-circle" size={32} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Practice Session</Text>
          </TouchableOpacity>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.totalHours}h</Text>
              <Text style={styles.statLabel}>Total Practice</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats.weeklyHours}h</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>

          {/* Recent Practice Sessions */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            {recentSessions.length === 0 ? (
              <Text style={styles.activityText}>No recent sessions found. Start a new one to see it here!</Text>
            ) : (
              recentSessions.map(session => (
                <View key={session._id} style={styles.activityItem}>
                  <Ionicons name="musical-notes" size={20} color="#3D9CFF" />
                  <Text style={styles.activityText}>
                    {new Date(session.startTime).toLocaleDateString()}
                    : {session.duration} min on {session.instrument}
                  </Text>
                </View>
              ))
            )}
          </View>
        </>
      )}

      {/* Friends Section (using mock data) */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          scrollEnabled={false} // Disable scrolling within the FlatList
        />
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      
      {renderOverview()}
    </View>
  );
};
// ... (your existing styles remain the same)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E1E1E',
    fontFamily: 'Nunito-Bold',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 5,
    fontFamily: 'Nunito-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#7BA8D9',
    fontFamily: 'Nunito-Regular',
  },
  xpSection: {
    backgroundColor: '#F8F9FA',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E1E',
    fontFamily: 'Nunito-Bold',
  },
  xpText: {
    fontSize: 14,
    color: '#7BA8D9',
    fontFamily: 'Nunito-Regular',
  },
  xpBar: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#3D9CFF',
    borderRadius: 4,
  },
  streakSection: {
    backgroundColor: '#F8F9FA',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  streakText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginTop: 10,
    fontFamily: 'Nunito-Bold',
  },
  streakSubtext: {
    fontSize: 14,
    color: '#7BA8D9',
    marginTop: 5,
    fontFamily: 'Nunito-Regular',
  },
  startButton: {
    backgroundColor: '#3D9CFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D9CFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Nunito-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 0,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3D9CFF',
    fontFamily: 'Nunito-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#7BA8D9',
    marginTop: 5,
    fontFamily: 'Nunito-Regular',
  },
  recentSection: {
    backgroundColor: '#F8F9FA',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 15,
    fontFamily: 'Nunito-Bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityText: {
    fontSize: 14,
    color: '#7BA8D9',
    marginLeft: 10,
    fontFamily: 'Nunito-Regular',
  },
  list: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  friendAvatar: {
    fontSize: 32,
    marginRight: 15,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E1E1E',
    marginBottom: 5,
    fontFamily: 'Nunito-Bold',
  },
  friendStats: {
    fontSize: 14,
    color: '#7BA8D9',
    fontFamily: 'Nunito-Regular',
  },
  addButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    color: '#7BA8D9'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  }
});
export default HomeScreen;